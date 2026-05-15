import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type RatingStarsProps = {
  value: number;
  className?: string;
};

export function RatingStars({ value, className }: RatingStarsProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index + 1 <= Math.round(value);

        return (
          <Star
            key={index}
            className={cn("size-4 text-amber-400", filled && "fill-amber-400")}
          />
        );
      })}
    </div>
  );
}
