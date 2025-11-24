import { Router } from 'express';
import { Achievement, Employee, Department, sequelize } from '../models';
import Target from '../models/Target';
import { Op, QueryTypes } from 'sequelize';

const router = Router();

// GET /api/dashboard/kapabilitas-risiko - Dashboard V1 (deprecated)
router.get('/kapabilitas-risiko', async (req, res) => {
  try {
    const { year } = req.query;
    const selectedYear = year ? parseInt(year as string) : new Date().getFullYear();

    // Get achievements for the year (type 1 = Learning Hours, type 2 = Certification)
    const achievements = await Achievement.findAll({
      where: {
        dateStart: {
          [Op.gte]: new Date(`${selectedYear}-01-01`),
          [Op.lte]: new Date(`${selectedYear}-12-31`),
        },
      },
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'name', 'department'],
          required: true,
        },
      ],
    });

    // Get targets for the year
    const targets = await Target.findAll({
      where: { year: selectedYear },
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['departmentID', 'deskripsi'],
        },
      ],
    });

    // Calculate statistics
    const learningHours = achievements
      .filter((a) => a.type === 1)
      .reduce((sum, a) => sum + (a.value || 0), 0);

    const certifications = achievements.filter((a) => a.type === 2).length;

    // Group by department
    const deptStats: Record<string, any> = {};
    
    achievements.forEach((ach) => {
      const deptId = ach.employee?.department;
      if (!deptId) return;

      if (!deptStats[deptId]) {
        deptStats[deptId] = {
          departmentId: deptId,
          learningHours: 0,
          certifications: 0,
          employees: new Set(),
        };
      }

      if (ach.type === 1) {
        deptStats[deptId].learningHours += ach.value || 0;
      } else if (ach.type === 2) {
        deptStats[deptId].certifications += 1;
      }
      deptStats[deptId].employees.add(ach.employeeId);
    });

    // Add department names and targets
    const departmentData = Object.values(deptStats).map((dept: any) => {
      const target = targets.find((t: any) => t.departmentId === dept.departmentId);
      const deptInfo = target?.department;

      return {
        departmentId: dept.departmentId,
        departmentName: deptInfo?.deskripsi || dept.departmentId,
        learningHours: dept.learningHours,
        learningHoursTarget: target?.learningHoursTarget || 0,
        certifications: dept.certifications,
        certificationsTarget: target?.certificationTarget || 0,
        employeeCount: dept.employees.size,
        learningHoursProgress: target?.learningHoursTarget
          ? Math.round((dept.learningHours / target.learningHoursTarget) * 100)
          : 0,
        certificationsProgress: target?.certificationTarget
          ? Math.round((dept.certifications / target.certificationTarget) * 100)
          : 0,
      };
    });

    // Calculate total targets
    const totalLearningHoursTarget = targets.reduce(
      (sum: number, t: any) => sum + (t.learningHoursTarget || 0),
      0
    );
    const totalCertificationsTarget = targets.reduce(
      (sum: number, t: any) => sum + (t.certificationTarget || 0),
      0
    );

    // Employee-level achievements
    const employeeStats: Record<string, any> = {};
    
    achievements.forEach((ach) => {
      const empId = ach.employeeId;
      if (!empId) return;

      if (!employeeStats[empId]) {
        employeeStats[empId] = {
          employeeId: empId,
          employeeName: ach.employee?.name || empId,
          department: ach.employee?.department || '',
          learningHours: 0,
          certifications: 0,
        };
      }

      if (ach.type === 1) {
        employeeStats[empId].learningHours += ach.value || 0;
      } else if (ach.type === 2) {
        employeeStats[empId].certifications += 1;
      }
    });

    const employeeData = Object.values(employeeStats)
      .sort((a: any, b: any) => b.learningHours - a.learningHours)
      .slice(0, 20); // Top 20 employees

    res.json({
      success: true,
      data: {
        year: selectedYear,
        summary: {
          totalLearningHours: learningHours,
          totalLearningHoursTarget,
          learningHoursProgress: totalLearningHoursTarget
            ? Math.round((learningHours / totalLearningHoursTarget) * 100)
            : 0,
          totalCertifications: certifications,
          totalCertificationsTarget,
          certificationsProgress: totalCertificationsTarget
            ? Math.round((certifications / totalCertificationsTarget) * 100)
            : 0,
          totalEmployees: Object.keys(employeeStats).length,
          totalDepartments: Object.keys(deptStats).length,
        },
        departmentData: departmentData.sort((a, b) =>
          a.departmentName.localeCompare(b.departmentName)
        ),
        employeeData,
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard data',
    });
  }
});

// ============ NEW COMPREHENSIVE DASHBOARD API ============
// Dashboard Kapabilitas Risiko V2 - Using Raw SQL from dashboard.md
router.get('/kapabilitas-risiko-v2', async (req, res) => {
  try {
    const { year, department, type } = req.query;
    const selectedYear = year ? parseInt(year as string) : new Date().getFullYear();
    
    // Build WHERE clause for filtering
    let deptFilter = department && department !== 'all' ? `AND department = '${department}'` : '';
    let typeFilter = type && type !== 'all' ? `AND achievement_type = ${type}` : '';

    // ========== Widget 1: Overview Pencapaian vs Target ==========
    const overviewQuery = `
      SELECT 
        achievement_type,
        CASE 
          WHEN achievement_type = 1 THEN 'Learning Hours'
          WHEN achievement_type = 2 THEN 'Sertifikasi'
        END AS jenis_pencapaian,
        COUNT(*) AS total_pencapaian,
        SUM(CASE WHEN achievement_type = 1 THEN achievement_value ELSE 0 END) AS total_learning_hours,
        SUM(CASE WHEN achievement_type = 2 THEN 1 ELSE 0 END) AS total_sertifikasi,
        AVG(CASE WHEN achievement_type = 1 THEN learning_hours_target ELSE certification_target END) AS target_tahunan,
        ROUND(
          CASE WHEN achievement_type = 1 THEN
            SUM(achievement_value) * 100.0 / NULLIF(AVG(learning_hours_target), 0)
          ELSE
            COUNT(*) * 100.0 / NULLIF(AVG(certification_target), 0)
          END, 2
        ) AS persentase_pencapaian
      FROM v_achievements
      WHERE YEAR(achievement_created_at) = ${selectedYear} ${deptFilter} ${typeFilter}
      GROUP BY achievement_type;
    `;

    // ========== Widget 2: Trend Pencapaian Bulanan ==========
    const trendQuery = `
      SELECT 
        FORMAT(achievement_created_at, 'yyyy-MM') AS bulan_tahun,
        achievement_type,
        COUNT(*) AS jumlah_pencapaian,
        SUM(achievement_value) AS total_nilai,
        AVG(CASE WHEN achievement_type = 1 THEN learning_hours_target ELSE certification_target END) AS target_bulanan
      FROM v_achievements
      WHERE achievement_created_at >= DATEADD(MONTH, -12, GETDATE()) ${deptFilter} ${typeFilter}
      GROUP BY FORMAT(achievement_created_at, 'yyyy-MM'), achievement_type
      ORDER BY bulan_tahun;
    `;

    // ========== Widget 3: Top Performers by Department ==========
    const topPerformersQuery = `
      SELECT TOP 20
        department,
        nama_pegawai,
        email,
        jabatan,
        COUNT(*) AS total_pencapaian,
        SUM(CASE WHEN achievement_type = 1 THEN achievement_value ELSE 0 END) AS total_learning_hours,
        SUM(CASE WHEN achievement_type = 2 THEN 1 ELSE 0 END) AS total_sertifikasi
      FROM v_achievements
      WHERE YEAR(achievement_created_at) = ${selectedYear} ${deptFilter} ${typeFilter}
      GROUP BY department, nama_pegawai, email, jabatan
      ORDER BY total_pencapaian DESC;
    `;

    // ========== Widget 4: Distribusi Jenis Pencapaian ==========
    const distribusiQuery = `
      SELECT 
        department,
        achievement_type,
        CASE 
          WHEN achievement_type = 1 THEN 'Learning Hours'
          WHEN achievement_type = 2 THEN 'Sertifikasi'
        END AS jenis_pencapaian,
        COUNT(*) AS jumlah,
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY department) AS persentase
      FROM v_achievements
      WHERE YEAR(achievement_created_at) = ${selectedYear} ${deptFilter} ${typeFilter}
      GROUP BY department, achievement_type
      ORDER BY department, achievement_type;
    `;

    // ========== Widget 5: Sertifikasi Mendekati Kadaluarsa ==========
    const kadaluarsaQuery = `
      SELECT 
        achievement_topic,
        nama_pegawai,
        department,
        jabatan,
        email,
        achievement_valid_until,
        DATEDIFF(DAY, GETDATE(), achievement_valid_until) AS hari_menuju_kadaluarsa
      FROM v_achievements
      WHERE achievement_type = 2
        AND achievement_valid_until BETWEEN GETDATE() AND DATEADD(MONTH, 3, GETDATE())
        ${deptFilter}
      ORDER BY achievement_valid_until ASC;
    `;

    // ========== Widget 6: Efektivitas Program Learning ==========
    const programQuery = `
      SELECT TOP 20
        achievement_topic,
        achievement_organizer,
        COUNT(DISTINCT achievement_employee) AS jumlah_peserta,
        AVG(achievement_value) AS rata_rata_jam_learning,
        MIN(achievement_value) AS jam_terendah,
        MAX(achievement_value) AS jam_tertinggi,
        DATEDIFF(DAY, achievement_date_start, achievement_date_end) AS durasi_hari
      FROM v_achievements
      WHERE achievement_type = 1 AND YEAR(achievement_created_at) = ${selectedYear} ${deptFilter}
      GROUP BY achievement_topic, achievement_organizer, 
               DATEDIFF(DAY, achievement_date_start, achievement_date_end)
      ORDER BY rata_rata_jam_learning DESC;
    `;

    // ========== Widget 7: Seasonal Pattern Analysis ==========
    const seasonalQuery = `
      SELECT 
        DATEPART(MONTH, achievement_created_at) AS bulan,
        DATENAME(MONTH, achievement_created_at) AS nama_bulan,
        achievement_type,
        COUNT(*) AS jumlah_pencapaian,
        AVG(COUNT(*)) OVER (PARTITION BY achievement_type) AS rata_rata_bulanan
      FROM v_achievements
      WHERE YEAR(achievement_created_at) = ${selectedYear} ${deptFilter} ${typeFilter}
      GROUP BY DATEPART(MONTH, achievement_created_at), 
               DATENAME(MONTH, achievement_created_at), 
               achievement_type
      ORDER BY bulan, achievement_type;
    `;

    // ========== Widget 8: Department Performance Dashboard ==========
    const deptPerformanceQuery = `
      SELECT 
        department,
        COUNT(*) AS total_pencapaian,
        SUM(CASE WHEN achievement_type = 1 THEN achievement_value ELSE 0 END) AS total_learning_hours,
        SUM(CASE WHEN achievement_type = 2 THEN 1 ELSE 0 END) AS total_sertifikasi,
        COUNT(DISTINCT achievement_employee) AS jumlah_pegawai_aktif,
        ROUND(
          SUM(CASE WHEN achievement_type = 1 THEN achievement_value ELSE 0 END) * 100.0 / 
          NULLIF(AVG(learning_hours_target), 0), 2
        ) AS persentase_target_learning,
        ROUND(
          SUM(CASE WHEN achievement_type = 2 THEN 1 ELSE 0 END) * 100.0 / 
          NULLIF(AVG(certification_target), 0), 2
        ) AS persentase_target_sertifikasi
      FROM v_achievements
      WHERE YEAR(achievement_created_at) = ${selectedYear} ${typeFilter}
      GROUP BY department
      ORDER BY total_pencapaian DESC;
    `;

    // ========== Widget 9: Achievement Velocity ==========
    const velocityQuery = `
      SELECT TOP 20
        nama_pegawai,
        department,
        COUNT(*) AS total_pencapaian,
        DATEDIFF(DAY, MIN(achievement_created_at), MAX(achievement_created_at)) AS rentang_hari_aktif,
        ROUND(
          COUNT(*) * 1.0 / NULLIF(DATEDIFF(DAY, MIN(achievement_created_at), MAX(achievement_created_at)), 0), 
          2
        ) AS pencapaian_per_hari,
        ROUND(
          SUM(CASE WHEN achievement_type = 1 THEN achievement_value ELSE 0 END) * 1.0 / 
          NULLIF(DATEDIFF(MONTH, MIN(achievement_created_at), MAX(achievement_created_at)), 0), 
          2
        ) AS learning_hours_per_bulan
      FROM v_achievements
      WHERE YEAR(achievement_created_at) = ${selectedYear} ${deptFilter}
      GROUP BY nama_pegawai, department
      HAVING COUNT(*) >= 3
      ORDER BY pencapaian_per_hari DESC;
    `;

    // ========== Widget 10: Organizer Effectiveness ==========
    const organizerQuery = `
      SELECT TOP 15
        achievement_organizer,
        COUNT(*) AS total_program,
        COUNT(DISTINCT achievement_topic) AS variasi_topik,
        COUNT(DISTINCT achievement_employee) AS total_peserta_unik,
        AVG(achievement_value) AS rata_rata_nilai,
        AVG(DATEDIFF(DAY, achievement_date_start, achievement_date_end)) AS rata_rata_durasi_hari
      FROM v_achievements
      WHERE achievement_organizer IS NOT NULL AND YEAR(achievement_created_at) = ${selectedYear} ${deptFilter}
      GROUP BY achievement_organizer
      HAVING COUNT(*) >= 2
      ORDER BY total_peserta_unik DESC;
    `;

    // Execute all queries
    const [
      overviewResult,
      trendResult,
      topPerformersResult,
      distribusiResult,
      kadaluarsaResult,
      programResult,
      seasonalResult,
      deptPerformanceResult,
      velocityResult,
      organizerResult
    ] = await Promise.all([
      sequelize.query(overviewQuery, { type: QueryTypes.SELECT }),
      sequelize.query(trendQuery, { type: QueryTypes.SELECT }),
      sequelize.query(topPerformersQuery, { type: QueryTypes.SELECT }),
      sequelize.query(distribusiQuery, { type: QueryTypes.SELECT }),
      sequelize.query(kadaluarsaQuery, { type: QueryTypes.SELECT }),
      sequelize.query(programQuery, { type: QueryTypes.SELECT }),
      sequelize.query(seasonalQuery, { type: QueryTypes.SELECT }),
      sequelize.query(deptPerformanceQuery, { type: QueryTypes.SELECT }),
      sequelize.query(velocityQuery, { type: QueryTypes.SELECT }),
      sequelize.query(organizerQuery, { type: QueryTypes.SELECT })
    ]);

    // Process Widget 1: Overview
    const lhOverview: any = overviewResult.find((r: any) => r.achievement_type === 1) || {};
    const certOverview: any = overviewResult.find((r: any) => r.achievement_type === 2) || {};

    const overview = {
      learningHours: {
        total: Math.round(lhOverview.total_learning_hours || 0),
        target: Math.round(lhOverview.target_tahunan || 0),
        percentage: Math.round(lhOverview.persentase_pencapaian || 0),
      },
      certifications: {
        total: certOverview.total_sertifikasi || 0,
        target: Math.round(certOverview.target_tahunan || 0),
        percentage: Math.round(certOverview.persentase_pencapaian || 0),
      },
    };

    // Process Widget 2: Trend Bulanan
    const trendByMonth: Record<string, any> = {};
    trendResult.forEach((row: any) => {
      if (!trendByMonth[row.bulan_tahun]) {
        trendByMonth[row.bulan_tahun] = {
          bulan: row.bulan_tahun,
          learningHoursAktual: 0,
          learningHoursTarget: 0,
          sertifikasiAktual: 0,
          sertifikasiTarget: 0,
        };
      }
      
      if (row.achievement_type === 1) {
        trendByMonth[row.bulan_tahun].learningHoursAktual = Math.round(row.total_nilai || 0);
        trendByMonth[row.bulan_tahun].learningHoursTarget = Math.round(row.target_bulanan || 0);
      } else if (row.achievement_type === 2) {
        trendByMonth[row.bulan_tahun].sertifikasiAktual = row.jumlah_pencapaian || 0;
        trendByMonth[row.bulan_tahun].sertifikasiTarget = Math.round(row.target_bulanan || 0);
      }
    });

    const trendBulanan = Object.values(trendByMonth);

    // Process Widget 3: Top Performers
    const topPerformers = topPerformersResult.map((row: any) => ({
      nama: row.nama_pegawai,
      department: row.department,
      jabatan: row.jabatan || 'N/A',
      totalLH: row.total_learning_hours || 0,
      totalCert: row.total_sertifikasi || 0,
      totalPencapaian: row.total_pencapaian || 0,
    }));

    // Process Widget 4: Distribusi Jenis
    const distribusiByDept: Record<string, any> = {};
    distribusiResult.forEach((row: any) => {
      if (!distribusiByDept[row.department]) {
        distribusiByDept[row.department] = {
          department: row.department,
          learningHours: 0,
          sertifikasi: 0,
        };
      }
      
      if (row.achievement_type === 1) {
        distribusiByDept[row.department].learningHours = row.jumlah || 0;
      } else if (row.achievement_type === 2) {
        distribusiByDept[row.department].sertifikasi = row.jumlah || 0;
      }
    });

    const distribusiJenis = Object.values(distribusiByDept);

    // Process Widget 5: Sertifikasi Kadaluarsa
    const sertifikasiKadaluarsa = kadaluarsaResult.map((row: any) => ({
      topic: row.achievement_topic || 'N/A',
      nama: row.nama_pegawai || 'N/A',
      department: row.department || 'N/A',
      jabatan: row.jabatan || 'N/A',
      validUntil: row.achievement_valid_until,
      hariMenjelang: row.hari_menuju_kadaluarsa || 0,
    }));

    // Process Widget 6: Efektivitas Program
    const efektivitasProgram = programResult.map((row: any) => ({
      topic: row.achievement_topic || 'Unknown',
      organizer: row.achievement_organizer || 'Unknown',
      peserta: row.jumlah_peserta || 0,
      rataJam: parseFloat((row.rata_rata_jam_learning || 0).toFixed(1)),
      durasi: row.durasi_hari > 0 ? row.durasi_hari : 1,
    }));

    // Process Widget 7: Seasonal Pattern
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const seasonalByMonth: Record<number, any> = {};
    
    seasonalResult.forEach((row: any) => {
      const month = row.bulan;
      if (!seasonalByMonth[month]) {
        seasonalByMonth[month] = { lh: 0, cert: 0 };
      }
      
      if (row.achievement_type === 1) {
        seasonalByMonth[month].lh = row.jumlah_pencapaian || 0;
      } else if (row.achievement_type === 2) {
        seasonalByMonth[month].cert = row.jumlah_pencapaian || 0;
      }
    });

    const polaMusimanLH = monthNames.slice(1).map((name, idx) => ({
      bulan: name,
      jumlah: seasonalByMonth[idx + 1]?.lh || 0,
    }));

    const polaMusimanCert = monthNames.slice(1).map((name, idx) => ({
      bulan: name,
      jumlah: seasonalByMonth[idx + 1]?.cert || 0,
    }));

    // Process Widget 8: Department Performance
    const departmentPerformance = deptPerformanceResult.map((row: any) => ({
      department: row.department,
      totalLH: Math.round(row.total_learning_hours || 0),
      totalCert: row.total_sertifikasi || 0,
      pegawaiAktif: row.jumlah_pegawai_aktif || 0,
      persenLH: Math.min(100, Math.round(row.persentase_target_learning || 0)),
      persenCert: Math.min(100, Math.round(row.persentase_target_sertifikasi || 0)),
    }));

    // Process Widget 9: Achievement Velocity
    const achievementVelocity = velocityResult.map((row: any) => ({
      nama: row.nama_pegawai,
      department: row.department,
      totalPencapaian: row.total_pencapaian || 0,
      pencapaianPerHari: parseFloat((row.pencapaian_per_hari || 0).toFixed(2)),
      lhPerBulan: parseFloat((row.learning_hours_per_bulan || 0).toFixed(2)),
    }));

    // Process Widget 10: Organizer Effectiveness
    const organizerEffectiveness = organizerResult.map((row: any) => ({
      organizer: row.achievement_organizer || 'Unknown',
      totalProgram: row.total_program || 0,
      variasiTopik: row.variasi_topik || 0,
      pesertaUnik: row.total_peserta_unik || 0,
      rataNilai: parseFloat((row.rata_rata_nilai || 0).toFixed(1)),
    }));

    // Send comprehensive response
    res.json({
      success: true,
      data: {
        overview,
        trendBulanan,
        topPerformers,
        distribusiJenis,
        sertifikasiKadaluarsa,
        efektivitasProgram,
        polaMusimanLH,
        polaMusimanCert,
        departmentPerformance,
        achievementVelocity,
        organizerEffectiveness,
      },
    });

  } catch (error: any) {
    console.error('Error fetching comprehensive dashboard data:', error);
    res.json({
      success: false,
      message: error.message || 'Failed to fetch dashboard data',
    });
  }
});

export default router;
