import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function EventCardSkeleton() {
  return (
    <Card className="bg-card/70 backdrop-blur-sm border border-foreground/10 h-full">
      <CardHeader className="p-3 sm:p-4 md:p-5">
        <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
          <Skeleton className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full" />
          <Skeleton className="h-3 sm:h-4 w-32 sm:w-40" />
        </div>
        <Skeleton className="h-6 sm:h-7 w-3/4 mb-2" />
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-5 pt-0">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-4/6" />
      </CardContent>
    </Card>
  )
}

export function TeamCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] w-full h-[280px] sm:h-[320px] md:h-[370px] bg-card/70 backdrop-blur border border-foreground/15 p-4 sm:p-5 md:p-6 flex flex-col items-center justify-start">
      <Skeleton className="size-28 sm:size-32 md:size-40 rounded-full mb-3 sm:mb-4" />
      <Skeleton className="h-4 w-24 sm:w-32 rounded-full" />
    </div>
  )
}

export function GalleryCardSkeleton() {
  return (
    <Card className="bg-card/70 backdrop-blur-sm border border-foreground/10 overflow-hidden">
      <Skeleton className="h-48 sm:h-56 md:h-64 w-full" />
      <CardContent className="p-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  )
}

export function TimelineItemSkeleton() {
  return (
    <div className="flex-none w-[75vw] xs:w-[65vw] sm:w-[55vw] md:w-[384px]">
      <Card className="bg-card/80 backdrop-blur-sm border-foreground/10 h-full overflow-hidden">
        <Skeleton className="h-32 sm:h-40 md:h-48 w-full" />
        <CardContent className="p-3 sm:p-4 md:p-5">
          <Skeleton className="h-4 w-24 mb-2 rounded-full" />
          <Skeleton className="h-6 w-full mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  )
}

export function TestimonialSkeleton() {
  return (
    <Card className="bg-white/90 dark:bg-card/70 border-black/10 dark:border-foreground/10 backdrop-blur-sm flex-none w-[72vw] sm:w-[60vw] md:w-auto">
      <CardHeader className="text-center p-2.5 sm:p-3 md:p-4">
        <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full mx-auto mb-2 sm:mb-2.5 md:mb-3" />
        <Skeleton className="h-5 w-32 mx-auto mb-2" />
        <Skeleton className="h-4 w-24 mx-auto" />
      </CardHeader>
      <CardContent className="p-2.5 sm:p-3 md:p-4 pt-0">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mx-auto" />
      </CardContent>
    </Card>
  )
}

export function HeroStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="bg-card/70 backdrop-blur-sm border border-foreground/10 p-4 sm:p-5 md:p-6">
          <Skeleton className="h-8 sm:h-10 md:h-12 w-20 mx-auto mb-2" />
          <Skeleton className="h-4 w-24 sm:w-32 mx-auto" />
        </Card>
      ))}
    </div>
  )
}
