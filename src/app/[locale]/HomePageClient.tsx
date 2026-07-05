"use client";

import { Suspense, lazy, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Coins,
  Clover,
  Crown,
  Dices,
  ExternalLink,
  Gamepad2,
  Heart,
  Info,
  Link2,
  ListChecks,
  Map,
  MapPin,
  Medal,
  MessageSquare,
  Moon,
  MoonStar,
  Newspaper,
  PauseCircle,
  RefreshCw,
  Scale,
  Server,
  Shield,
  ShoppingBag,
  Shuffle,
  Skull,
  Sparkles,
  Star,
  Swords,
  Target,
  Ticket,
  Trello,
  Trash2,
  TrendingUp,
  Users,
  Wrench,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

// 工具卡片 → section id 1:1 映射（顺序与 en.json tools.cards 一致）
const toolSectionIds = [
  "roll-to-defend-codes",
  "roll-to-defend-beginner-guide",
  "roll-to-defend-tier-list",
  "roll-to-defend-best-units",
  "roll-to-defend-upgrades-guide",
  "roll-to-defend-zones-guide",
  "roll-to-defend-luck-and-offline-income",
  "roll-to-defend-official-links",
];

// Beginner 步骤图标（按索引，每个步骤不同图标）
const beginnerStepIcons = [
  Dices,
  MapPin,
  Swords,
  Coins,
  Map,
  Clover,
  MoonStar,
];

// Tier 图标映射
const tierIcons: Record<string, typeof Crown> = {
  S: Crown,
  A: Award,
  B: Medal,
  C: Trash2,
};

// Tier 头部背景梯度（S→C 递减）
const tierHeaderClass: Record<string, string> = {
  S: "bg-[hsl(var(--nav-theme)/0.25)] border-[hsl(var(--nav-theme)/0.5)]",
  A: "bg-[hsl(var(--nav-theme)/0.18)] border-[hsl(var(--nav-theme)/0.4)]",
  B: "bg-white/10 border-border",
  C: "bg-white/5 border-border",
};

// Best Units 卡片图标（按索引，每个单位不同图标）
const bestUnitIcons = [Skull, Crown, Star, Shield, MapPin];

// Current Rewards 卡片图标（按索引）
const rewardIcons = [Users, Heart, Moon];

// Upgrades 表格 priority 图标（按档位）
const upgradePriorityIcons: Record<string, typeof Shield> = {
  High: Shield,
  Medium: Scale,
  Flexible: Shuffle,
};

// Upgrades 表格 priority 标签样式（High 实心 / Medium 半透明 / Flexible 中性，全主题变量）
const upgradePriorityClass: Record<string, string> = {
  High: "bg-[hsl(var(--nav-theme))] text-white border-[hsl(var(--nav-theme)/0.5)]",
  Medium:
    "bg-[hsl(var(--nav-theme)/0.15)] text-[hsl(var(--nav-theme-light))] border-[hsl(var(--nav-theme)/0.4)]",
  Flexible: "bg-white/5 text-muted-foreground border-border",
};

// Zones 步骤图标（6 步各不相同，按索引）
const zoneStepIcons = [Shield, Target, Coins, RefreshCw, TrendingUp, PauseCircle];

// Luck accordion 各段图标（5 段各不相同，按索引）
const luckSectionIcons = [Users, Heart, Dices, Moon, Coins];

// Official Links 各卡片图标（8 个各不相同，按 en.json links 顺序）
const officialLinkIcons = [
  Gamepad2,
  Users,
  ShoppingBag,
  Server,
  Newspaper,
  MessageSquare,
  Trello,
  Youtube,
];

export default function HomePageClient({
  latestArticles,
  moduleLinkMap,
  locale,
}: HomePageClientProps) {
  // page.tsx 仍传这三个 prop，但首页模块渲染不再依赖内部 URL 链接
  void latestArticles;
  void moduleLinkMap;
  void locale;

  const t = useMessages() as any;

  // Luck accordion 各段初始展开态（从数据 defaultOpen 字段派生，仅挂载时初始化一次）
  const [openLuckSections, setOpenLuckSections] = useState<
    Record<number, boolean>
  >(() => {
    const sections =
      t.modules?.rollToDoDefendLuckAndOfflineIncome?.sections || [];
    const initial: Record<number, boolean> = {};
    sections.forEach((s: any, i: number) => {
      initial[i] = !!s.defaultOpen;
    });
    return initial;
  });

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.rolltodefendwiki.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Roll to Defend Wiki",
        description:
          "Complete Roll to Defend Wiki covering codes, units, upgrades, zones, luck, offline income, and zombie defense tips for the Roblox roll-based defense simulator.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Roll to Defend - Roll-Based Zombie Defense Simulator",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Roll to Defend Wiki",
        alternateName: "Roll to Defend",
        url: siteUrl,
        description:
          "Complete Roll to Defend Wiki resource hub for codes, units, upgrades, zones, luck, offline income, and zombie defense guides",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Roll to Defend Wiki - Roll-Based Zombie Defense Simulator",
        },
        sameAs: [
          "https://www.roblox.com/games/129559579789369/Roll-to-Defend",
          "https://www.roblox.com/communities/861213399/D-Drive",
          "https://www.youtube.com/watch?v=UzGrAltqQC4",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Roll to Defend",
        gamePlatform: ["PC", "Mac", "Mobile", "Roblox"],
        applicationCategory: "Game",
        genre: ["Strategy", "Tower Defense", "Zombie", "Roblox"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 100,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://www.roblox.com/games/129559579789369/Roll-to-Defend",
        },
      },
      {
        "@type": "VideoObject",
        name: "How to Play Roll to Defend Roblox - Full Guide",
        description:
          "Roll to Defend gameplay and full guide covering rolling units, defending against zombie waves, upgrades, zones, and luck for Roblox players.",
        uploadDate: "2026-07-05",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/UzGrAltqQC4",
        url: "https://www.youtube.com/watch?v=UzGrAltqQC4",
      },
    ],
  };

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("roll-to-defend-codes")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/games/129559579789369/Roll-to-Defend"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section - 紧跟 Hero 区域（max-w-5xl，不挤压广告位） */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="UzGrAltqQC4"
              title="How to Play Roll to Defend Roblox - Full Guide"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 4 Navigation Cards（视频区之后，模块之前） */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = toolSectionIds[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                bg-[hsl(var(--nav-theme)/0.1)]
                                flex items-center justify-center
                                group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Roll to Defend Codes (code-cards) */}
      <section id="roll-to-defend-codes" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.rollToDoDefendCodes.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-2">
              {t.modules.rollToDoDefendCodes.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto">
              {t.modules.rollToDoDefendCodes.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 scroll-reveal">
            {/* 左列：Active + Expired 空状态 */}
            <div className="space-y-4">
              <div className="p-5 md:p-6 bg-white/5 border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Ticket className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                  <h3 className="font-bold">
                    {t.modules.rollToDoDefendCodes.activeCodes.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.modules.rollToDoDefendCodes.activeCodes.emptyState}
                </p>
              </div>
              <div className="p-5 md:p-6 bg-white/5 border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                  <h3 className="font-bold">
                    {t.modules.rollToDoDefendCodes.expiredCodes.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t.modules.rollToDoDefendCodes.expiredCodes.emptyState}
                </p>
              </div>
            </div>

            {/* 右列：Current Reward Sources */}
            <div className="p-5 md:p-6 bg-white/5 border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                <h3 className="font-bold">
                  {t.modules.rollToDoDefendCodes.currentRewards.title}
                </h3>
              </div>
              <div className="space-y-3">
                {t.modules.rollToDoDefendCodes.currentRewards.cards.map(
                  (card: any, index: number) => {
                    const RewardIcon = rewardIcons[index] || Coins;
                    return (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-white/5 border border-border"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <RewardIcon className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                          <h4 className="font-semibold text-sm">{card.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {card.reward}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {card.howToGet}
                        </p>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>

          {/* Redeem Steps */}
          <div className="scroll-reveal p-5 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-4">
              <ListChecks className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold">
                {t.modules.rollToDoDefendCodes.redeemSteps.title}
              </h3>
            </div>
            <ol className="space-y-2 mb-4">
              {t.modules.rollToDoDefendCodes.redeemSteps.steps.map(
                (step: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[hsl(var(--nav-theme)/0.2)] border border-[hsl(var(--nav-theme)/0.5)] flex items-center justify-center text-xs font-bold text-[hsl(var(--nav-theme-light))]">
                      {index + 1}
                    </span>
                    <span className="text-sm text-muted-foreground pt-0.5">
                      {step}
                    </span>
                  </li>
                ),
              )}
            </ol>
            <div className="flex items-start gap-2 pt-3 border-t border-border">
              <Info className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                {t.modules.rollToDoDefendCodes.redeemSteps.note}
              </p>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-3">
              Last checked: {t.modules.rollToDoDefendCodes.lastChecked}
            </p>
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Roll to Defend Beginner Guide (step-by-step) */}
      <section
        id="roll-to-defend-beginner-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.rollToDoDefendBeginnerGuide.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-2">
              {t.modules.rollToDoDefendBeginnerGuide.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto">
              {t.modules.rollToDoDefendBeginnerGuide.intro}
            </p>
          </div>

          <div className="space-y-3 md:space-y-4 scroll-reveal">
            {t.modules.rollToDoDefendBeginnerGuide.steps.map(
              (step: any, index: number) => {
                const StepIcon = beginnerStepIcons[index] || Dices;
                return (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                  >
                    <div className="flex items-center gap-3 md:flex-shrink-0">
                      <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                        <StepIcon className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                      </div>
                      <span className="md:hidden text-sm font-bold text-[hsl(var(--nav-theme-light))]">
                        Step {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                        <span className="hidden md:inline text-sm font-medium text-muted-foreground mr-2">
                          Step {index + 1}:
                        </span>
                        {step.title}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground mb-2">
                        {step.body}
                      </p>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.2)]">
                        <Target className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {step.playerAction}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* 广告位 5: 移动端横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 3: Roll to Defend Tier List (tier-grid) */}
      <section
        id="roll-to-defend-tier-list"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.rollToDoDefendTierList.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-2">
              {t.modules.rollToDoDefendTierList.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto">
              {t.modules.rollToDoDefendTierList.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 scroll-reveal">
            {t.modules.rollToDoDefendTierList.tiers.map(
              (tier: any, index: number) => {
                const TierIcon = tierIcons[tier.tier] || Award;
                const headerClass =
                  tierHeaderClass[tier.tier] || tierHeaderClass.B;
                return (
                  <div
                    key={index}
                    className="rounded-xl border border-border overflow-hidden bg-white/[0.02]"
                  >
                    <div
                      className={`p-4 border-b flex items-center gap-2 ${headerClass}`}
                    >
                      <TierIcon className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                      <div>
                        <div className="text-2xl font-bold text-[hsl(var(--nav-theme-light))]">
                          {tier.tier}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tier.label}
                        </div>
                      </div>
                    </div>
                    <div className="p-3 space-y-3">
                      {tier.cards.map((card: any, ci: number) => (
                        <div
                          key={ci}
                          className="p-3 rounded-lg bg-white/5 border border-border"
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-sm">{card.name}</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] whitespace-nowrap">
                              {card.rarity}
                            </span>
                          </div>
                          <p className="text-xs text-[hsl(var(--nav-theme-light))] mb-1">
                            {card.role}
                          </p>
                          <p className="text-xs text-muted-foreground mb-1">
                            <span className="font-medium">Best for:</span>{" "}
                            {card.bestFor}
                          </p>
                          <p className="text-xs text-muted-foreground/80 italic">
                            {card.why}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅 320×50 */}
      <AdBanner
        type="banner-320x50"
        adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50}
        className="md:hidden"
      />

      {/* Module 4: Roll to Defend Best Units (card-list) */}
      <section
        id="roll-to-defend-best-units"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.rollToDoDefendBestUnits.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-2">
              {t.modules.rollToDoDefendBestUnits.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto">
              {t.modules.rollToDoDefendBestUnits.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 scroll-reveal">
            {t.modules.rollToDoDefendBestUnits.units.map(
              (unit: any, index: number) => {
                const UnitIcon = bestUnitIcons[index] || Star;
                return (
                  <div
                    key={index}
                    className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <UnitIcon className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                      <h3 className="font-bold">{unit.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                        {unit.rarity}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-border">
                        {unit.stage}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-2">{unit.use}</p>
                    <p className="text-xs text-muted-foreground">{unit.details}</p>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* 广告位: 模块 4 与模块 5 之间 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 5: Roll to Defend Upgrades Guide (upgrade-grid) */}
      <section
        id="roll-to-defend-upgrades-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.rollToDoDefendUpgradesGuide.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-2">
              {t.modules.rollToDoDefendUpgradesGuide.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto">
              {t.modules.rollToDoDefendUpgradesGuide.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 scroll-reveal">
            {t.modules.rollToDoDefendUpgradesGuide.items.map(
              (item: any, index: number) => {
                const PriorityIcon =
                  upgradePriorityIcons[item.priority] || Scale;
                const priorityClass =
                  upgradePriorityClass[item.priority] ||
                  upgradePriorityClass.Flexible;
                return (
                  <div
                    key={index}
                    className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Wrench className="w-5 h-5 text-[hsl(var(--nav-theme-light))] flex-shrink-0" />
                        <h3 className="font-bold">{item.upgrade_focus}</h3>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border whitespace-nowrap ${priorityClass}`}
                      >
                        <PriorityIcon className="w-3 h-3" />
                        {item.priority}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium text-[hsl(var(--nav-theme-light))]">
                          {t.modules.rollToDoDefendUpgradesGuide.columns.buyWhen}:
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {item.buy_when}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium text-[hsl(var(--nav-theme-light))]">
                          {t.modules.rollToDoDefendUpgradesGuide.columns.bestUse}:
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {item.best_use}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">
                          {t.modules.rollToDoDefendUpgradesGuide.columns.delayWhen}:
                        </span>{" "}
                        <span className="text-muted-foreground/80">
                          {item.delay_when}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* 广告位: 模块 5 与模块 6 之间 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 6: Roll to Defend Zones Guide (step-by-step) */}
      <section
        id="roll-to-defend-zones-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.rollToDoDefendZonesGuide.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-2">
              {t.modules.rollToDoDefendZonesGuide.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto">
              {t.modules.rollToDoDefendZonesGuide.intro}
            </p>
          </div>

          <div className="space-y-3 md:space-y-4 scroll-reveal">
            {t.modules.rollToDoDefendZonesGuide.steps.map(
              (step: any, index: number) => {
                const StepIcon = zoneStepIcons[index] || Map;
                return (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                  >
                    <div className="flex items-center gap-3 md:flex-shrink-0">
                      <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                        <StepIcon className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                      </div>
                      <span className="md:hidden text-sm font-bold text-[hsl(var(--nav-theme-light))]">
                        Step {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                        <span className="hidden md:inline text-sm font-medium text-muted-foreground mr-2">
                          Step {index + 1}:
                        </span>
                        {step.title}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground mb-2">
                        {step.action}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground/80 italic mb-2">
                        {step.whyItMatters}
                      </p>
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.2)]">
                        <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                        <p className="text-xs md:text-sm text-muted-foreground">
                          <span className="font-medium text-[hsl(var(--nav-theme-light))]">
                            Ready when:
                          </span>{" "}
                          {step.readySignal}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* 广告位: 模块 6 与模块 7 之间 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 7: Roll to Defend Luck & Offline Income (accordion) */}
      <section
        id="roll-to-defend-luck-and-offline-income"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.rollToDoDefendLuckAndOfflineIncome.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-2">
              {t.modules.rollToDoDefendLuckAndOfflineIncome.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto">
              {t.modules.rollToDoDefendLuckAndOfflineIncome.intro}
            </p>
          </div>

          <div className="space-y-3 scroll-reveal">
            {t.modules.rollToDoDefendLuckAndOfflineIncome.sections.map(
              (sec: any, index: number) => {
                const SectionIcon = luckSectionIcons[index] || Dices;
                const isOpen = !!openLuckSections[index];
                return (
                  <div
                    key={index}
                    className="bg-white/5 border border-border rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenLuckSections((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }))
                      }
                      aria-expanded={isOpen}
                      className="flex items-center gap-3 w-full p-4 md:p-5 text-left hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--nav-theme)/0.4)] bg-[hsl(var(--nav-theme)/0.15)] flex-shrink-0">
                        <SectionIcon className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold">{sec.heading}</h3>
                        <p className="text-xs text-muted-foreground">
                          {sec.summary}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 md:px-5 pb-4 md:pb-5 space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {sec.content}
                        </p>
                        {sec.checklist && sec.checklist.length > 0 && (
                          <ul className="space-y-1.5">
                            {sec.checklist.map((task: string, ci: number) => (
                              <li
                                key={ci}
                                className="flex items-start gap-2 text-sm"
                              >
                                <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">
                                  {task}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* 广告位: 模块 7 与模块 8 之间 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 8: Roll to Defend Official Links (link-grid) */}
      <section
        id="roll-to-defend-official-links"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.modules.rollToDoDefendOfficialLinks.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-2">
              {t.modules.rollToDoDefendOfficialLinks.subtitle}
            </p>
            <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto">
              {t.modules.rollToDoDefendOfficialLinks.intro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 scroll-reveal">
            {t.modules.rollToDoDefendOfficialLinks.links.map(
              (link: any, index: number) => {
                const LinkIcon = officialLinkIcons[index] || Link2;
                return (
                  <a
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] hover:bg-white/[0.07] transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <LinkIcon className="w-5 h-5 text-[hsl(var(--nav-theme-light))] flex-shrink-0" />
                        <h3 className="font-bold truncate">{link.title}</h3>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-[hsl(var(--nav-theme-light))] transition-colors flex-shrink-0" />
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                        {link.type}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-border">
                        {link.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{link.useFor}</p>
                  </a>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.roblox.com/games/129559579789369/Roll-to-Defend"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/communities/861213399/D-Drive"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.twitter}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=UzGrAltqQC4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/search?keyword=Roll-to-Defend"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamStore}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
