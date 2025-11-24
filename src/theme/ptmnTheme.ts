import type { ThemeConfig } from 'antd';

// Pertamina Color Palette
export const ptmnColors = {
  black: '#082313',
  blue: '#006cb8',
  green: '#acc42a',
  red: '#ed1b2f',
  // Derived colors
  blueDark: '#005090',
  blueLight: '#0088e0',
  greenDark: '#8fa622',
  greenLight: '#c4d965',
};

// Light theme (default)
export const ptmnTheme: ThemeConfig = {
  token: {
    // Primary color - Pertamina Blue
    colorPrimary: ptmnColors.blue,
    colorLink: ptmnColors.blue,
    colorLinkHover: ptmnColors.blueDark,
    colorLinkActive: ptmnColors.blueDark,
    
    // Success color - Pertamina Green
    colorSuccess: ptmnColors.green,
    colorSuccessBg: '#f6fae8',
    colorSuccessBorder: '#d9e89f',
    
    // Error color - Pertamina Red
    colorError: ptmnColors.red,
    colorErrorBg: '#fef0f2',
    colorErrorBorder: '#f8c4cb',
    
    // Warning color
    colorWarning: '#faad14',
    
    // Info color - Pertamina Blue
    colorInfo: ptmnColors.blue,
    colorInfoBg: '#e6f4ff',
    colorInfoBorder: '#91caff',
    
    // Text colors
    colorText: ptmnColors.black,
    colorTextSecondary: 'rgba(8, 35, 19, 0.65)',
    colorTextTertiary: 'rgba(8, 35, 19, 0.45)',
    colorTextQuaternary: 'rgba(8, 35, 19, 0.25)',
    
    // Border
    colorBorder: '#d9d9d9',
    colorBorderSecondary: '#f0f0f0',
    
    // Background
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f5f5f5',
    
    // Font
    fontSize: 14,
    fontFamily: '"Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    
    // Border radius
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    
    // Control height
    controlHeight: 32,
    controlHeightLG: 40,
    controlHeightSM: 24,
  },
  components: {
    Button: {
      primaryColor: '#ffffff',
      colorPrimary: ptmnColors.blue,
      colorPrimaryHover: ptmnColors.blueLight,
      colorPrimaryActive: ptmnColors.blueDark,
      defaultBorderColor: ptmnColors.blue,
      defaultColor: ptmnColors.blue,
    },
    Menu: {
      itemSelectedBg: '#e6f4ff',
      itemSelectedColor: ptmnColors.blue,
      itemHoverBg: '#f5f5f5',
      itemHoverColor: ptmnColors.blue,
      itemActiveBg: '#e6f4ff',
      iconSize: 16,
      itemMarginInline: 4,
    },
    Layout: {
      siderBg: '#ffffff',
      headerBg: '#ffffff',
      bodyBg: '#f5f5f5',
      triggerBg: ptmnColors.blue,
      triggerColor: '#ffffff',
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: ptmnColors.black,
      rowHoverBg: '#f5f5f5',
      borderColor: '#f0f0f0',
    },
    Card: {
      colorBorderSecondary: '#f0f0f0',
      boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
    },
    Tag: {
      defaultBg: '#fafafa',
      defaultColor: ptmnColors.black,
    },
    Input: {
      activeBorderColor: ptmnColors.blue,
      hoverBorderColor: ptmnColors.blueLight,
    },
    Select: {
      optionSelectedBg: '#e6f4ff',
      optionSelectedColor: ptmnColors.blue,
      optionActiveBg: '#f5f5f5',
    },
    Modal: {
      headerBg: '#ffffff',
      contentBg: '#ffffff',
      footerBg: '#ffffff',
    },
    Tabs: {
      itemSelectedColor: ptmnColors.blue,
      itemHoverColor: ptmnColors.blueLight,
      inkBarColor: ptmnColors.blue,
    },
    Badge: {
      colorError: ptmnColors.red,
      colorSuccess: ptmnColors.green,
    },
    Alert: {
      colorInfoBg: '#e6f4ff',
      colorInfoBorder: '#91caff',
      colorSuccessBg: '#f6fae8',
      colorSuccessBorder: '#d9e89f',
      colorErrorBg: '#fef0f2',
      colorErrorBorder: '#f8c4cb',
    },
  },
};

// Dark theme
export const ptmnDarkTheme: ThemeConfig = {
  token: {
    // Primary color - Pertamina Blue
    colorPrimary: ptmnColors.blue,
    colorLink: ptmnColors.blueLight,
    colorLinkHover: '#4db3ff',
    colorLinkActive: ptmnColors.blue,
    
    // Success color - Pertamina Green
    colorSuccess: ptmnColors.green,
    colorSuccessBg: '#1e2614',
    colorSuccessBorder: '#3a4a1f',
    
    // Error color - Pertamina Red
    colorError: ptmnColors.red,
    colorErrorBg: '#2d1215',
    colorErrorBorder: '#58181e',
    
    // Warning color
    colorWarning: '#faad14',
    
    // Info color - Pertamina Blue
    colorInfo: ptmnColors.blue,
    colorInfoBg: '#111b26',
    colorInfoBorder: '#15395b',
    
    // Text colors (light text for dark background)
    colorText: 'rgba(255, 255, 255, 0.85)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    colorTextTertiary: 'rgba(255, 255, 255, 0.45)',
    colorTextQuaternary: 'rgba(255, 255, 255, 0.25)',
    
    // Border
    colorBorder: '#424242',
    colorBorderSecondary: '#303030',
    
    // Background (dark)
    colorBgContainer: '#0f1419',
    colorBgElevated: '#1a2332',
    colorBgLayout: '#0a0f1a',
    
    // Font
    fontSize: 14,
    fontFamily: '"Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    
    // Border radius
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    
    // Control height
    controlHeight: 32,
    controlHeightLG: 40,
    controlHeightSM: 24,
  },
  components: {
    Button: {
      primaryColor: '#ffffff',
      colorPrimary: ptmnColors.blue,
      colorPrimaryHover: ptmnColors.blueLight,
      colorPrimaryActive: ptmnColors.blueDark,
      defaultBorderColor: '#424242',
      defaultColor: 'rgba(255, 255, 255, 0.85)',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(0, 108, 184, 0.15)',
      itemSelectedColor: ptmnColors.blueLight,
      itemHoverBg: 'rgba(255, 255, 255, 0.08)',
      itemHoverColor: ptmnColors.blueLight,
      itemActiveBg: 'rgba(0, 108, 184, 0.15)',
      iconSize: 16,
      itemMarginInline: 4,
    },
    Layout: {
      siderBg: '#001529',
      headerBg: '#0f1419',
      bodyBg: '#0a0f1a',
      triggerBg: ptmnColors.blue,
      triggerColor: '#ffffff',
    },
    Table: {
      headerBg: '#1a2332',
      headerColor: 'rgba(255, 255, 255, 0.85)',
      rowHoverBg: '#1a2332',
      borderColor: '#1a2332',
    },
    Card: {
      colorBgContainer: '#0f1419',
      colorBorderSecondary: '#1a2332',
      boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.15)',
    },
    Tag: {
      defaultBg: '#262626',
      defaultColor: 'rgba(255, 255, 255, 0.85)',
    },
    Input: {
      activeBorderColor: ptmnColors.blue,
      hoverBorderColor: ptmnColors.blueLight,
      colorBgContainer: '#262626',
      colorText: 'rgba(255, 255, 255, 0.85)',
    },
    Select: {
      optionSelectedBg: 'rgba(0, 108, 184, 0.15)',
      optionSelectedColor: ptmnColors.blueLight,
      optionActiveBg: '#262626',
      colorBgContainer: '#262626',
      colorText: 'rgba(255, 255, 255, 0.85)',
    },
    Modal: {
      headerBg: '#1f1f1f',
      contentBg: '#1f1f1f',
      footerBg: '#1f1f1f',
    },
    Tabs: {
      itemSelectedColor: ptmnColors.blueLight,
      itemHoverColor: '#4db3ff',
      inkBarColor: ptmnColors.blue,
    },
    Badge: {
      colorError: ptmnColors.red,
      colorSuccess: ptmnColors.green,
    },
    Alert: {
      colorInfoBg: '#111b26',
      colorInfoBorder: '#15395b',
      colorSuccessBg: '#1e2614',
      colorSuccessBorder: '#3a4a1f',
      colorErrorBg: '#2d1215',
      colorErrorBorder: '#58181e',
    },
  },
};

export default ptmnTheme;
