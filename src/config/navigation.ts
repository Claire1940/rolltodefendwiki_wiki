import type { LucideIcon } from 'lucide-react'
import {
	Ticket,
	BookOpen,
	Swords,
	Clover,
	RefreshCw,
	Coins,
	Map,
	Package,
} from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'codes' -> t('nav.codes')
	path: string // URL 路径，如 '/codes'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

// 导航配置：Roll to Defend 8 个内容分类
export const NAVIGATION_CONFIG: NavigationItem[] = [
	{ key: 'codes', path: '/codes', icon: Ticket, isContentType: true },
	{ key: 'guide', path: '/guide', icon: BookOpen, isContentType: true },
	{ key: 'units', path: '/units', icon: Swords, isContentType: true },
	{ key: 'luck', path: '/luck', icon: Clover, isContentType: true },
	{ key: 'rebirth', path: '/rebirth', icon: RefreshCw, isContentType: true },
	{ key: 'currency', path: '/currency', icon: Coins, isContentType: true },
	{ key: 'zones', path: '/zones', icon: Map, isContentType: true },
	{ key: 'items', path: '/items', icon: Package, isContentType: true },
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移除开头的 '/' -> ['codes', 'guide', 'units', 'luck', 'rebirth', 'currency', 'zones', 'items']

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}
