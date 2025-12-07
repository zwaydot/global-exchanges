/**
 * 用户行为分析追踪工具
 * 用于统计访问数据和关键用户行为
 */

export type AnalyticsEventType = 
  | 'page_view'           // 页面访问
  | 'exchange_click'     // 点击交易所名称/标签
  | 'marker_click'       // 点击标记点
  | 'copy_image'         // 点击复制图片按钮
  | 'panel_open'         // 打开详情面板
  | 'panel_close';       // 关闭详情面板

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: number;
  // 事件特定数据
  exchangeId?: string;
  exchangeName?: string;
  clickSource?: 'label' | 'point' | 'marker' | 'custom_layer'; // 点击来源
  // 用户环境信息（匿名化）
  userAgent?: string;
  referrer?: string;
  screenWidth?: number;
  screenHeight?: number;
  // 会话标识（基于 localStorage，不包含个人信息）
  sessionId?: string;
}

// 向 Umami 上报自定义事件（可选）
function trackUmami(eventName: string, data?: Record<string, any>): void {
  try {
    const umami = (typeof window !== 'undefined' && (window as any).umami) ? (window as any).umami : null;
    if (umami && typeof umami.track === 'function') {
      umami.track(eventName, data);
    }
  } catch (e) {
    // 静默忽略，不打断主流程
  }
}

/**
 * 追踪页面访问
 */
export function trackPageView(): void {
  // Umami 脚本已自带 PV 统计，这里保持兼容但不重复上报
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    console.log('[Analytics] page_view skipped (handled by Umami)');
  }
}

/**
 * 追踪交易所点击事件
 * @param exchangeId 交易所 ID
 * @param exchangeName 交易所名称
 * @param source 点击来源（label=标签文字, point=标记点, marker=3D 标记柱）
 */
export function trackExchangeClick(
  exchangeId: string,
  exchangeName: string,
  source: 'label' | 'point' | 'marker' | 'custom_layer' = 'point'
): void {
  trackUmami('exchange_click', {
    exchange: exchangeName,   // 方便在 Umami 属性里直接看到名称
    exchangeId,
    source,
  });
}

/**
 * 追踪标记点点击（与交易所点击类似，但单独统计）
 */
export function trackMarkerClick(
  exchangeId: string,
  exchangeName: string
): void {
  trackUmami('marker_click', {
    exchange: exchangeName,
    exchangeId,
  });
}

/**
 * 追踪复制图片按钮点击
 * @param exchangeName 交易所名称
 */
export function trackCopyImage(exchangeName: string): void {
  trackUmami('copy_image', { exchangeName });
}

/**
 * 追踪详情面板打开
 * @param exchangeId 交易所 ID
 * @param exchangeName 交易所名称
 */
export function trackPanelOpen(exchangeId: string, exchangeName: string): void {
  trackUmami('panel_open', { exchangeId, exchangeName });
}

/**
 * 追踪详情面板关闭
 */
export function trackPanelClose(): void {
  trackUmami('panel_close');
}
