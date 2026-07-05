import { MetadataRoute } from 'next'
import { getAllContent, CONTENT_TYPES, type ContentType } from '@/lib/content'
import { routing, type Locale } from '@/i18n/routing'

// output:'export' 要求路由处理器显式声明静态
export const dynamic = 'force-static'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.rolltodefendwiki.wiki'

// 内容类型优先级配置（与 navigation.ts 的 CONTENT_TYPES 一致：codes/guide/units/luck/rebirth/currency/zones/items）
const contentTypePriority: Record<string, number> = {
	'codes': 0.9, // 兑换码：核心流量入口
	'guide': 0.9, // 攻略：核心内容
	'units': 0.8, // 单位图鉴
	'luck': 0.8, // 幸运机制
	'rebirth': 0.8, // 转生系统
	'currency': 0.7, // 货币
	'zones': 0.7, // 区域
	'items': 0.7, // 物品
}

// 内容更新频率配置（codes 每日更新，其余每周）
const contentTypeChangeFrequency: Record<string, 'daily' | 'weekly' | 'monthly'> = {
	'codes': 'daily',
	'guide': 'weekly',
	'units': 'weekly',
	'luck': 'weekly',
	'rebirth': 'weekly',
	'currency': 'weekly',
	'zones': 'weekly',
	'items': 'weekly',
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const sitemap: MetadataRoute.Sitemap = []

	// 1. 首页（所有语言版本）
	for (const locale of routing.locales) {
		sitemap.push({
			url: locale === 'en' ? BASE_URL : `${BASE_URL}/${locale}`,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 1.0,
		})
	}

	// 2. 内容分类页和所有 MDX 文章（所有语言版本和内容类型）
	for (const locale of routing.locales) {
		for (const contentType of CONTENT_TYPES) {
			try {
				const articles = await getAllContent(contentType as ContentType, locale as Locale, {
					includeFallback: false,
				})
				const priority = contentTypePriority[contentType] || 0.7
				const changeFrequency = contentTypeChangeFrequency[contentType] || 'weekly'

				if (articles.length > 1) {
					const listUrl =
						locale === 'en'
							? `${BASE_URL}/${contentType}`
							: `${BASE_URL}/${locale}/${contentType}`
					const latestArticle = articles[0]
					const latestDate = latestArticle.frontmatter.lastModified || latestArticle.frontmatter.date

					sitemap.push({
						url: listUrl,
						lastModified: latestDate ? new Date(latestDate) : new Date(),
						changeFrequency,
						priority: Math.min(priority + 0.05, 0.95),
					})
				}

				for (const article of articles) {
					const articleUrl =
						locale === 'en'
							? `${BASE_URL}/${contentType}/${article.slug}`
							: `${BASE_URL}/${locale}/${contentType}/${article.slug}`
					const articleDate = article.frontmatter.lastModified || article.frontmatter.date

					sitemap.push({
						url: articleUrl,
						lastModified: articleDate ? new Date(articleDate) : new Date(),
						changeFrequency,
						priority,
					})
				}
			} catch (error) {
				console.warn(`Failed to load content for ${locale}/${contentType}:`, error)
			}
		}
	}

	return sitemap
}
