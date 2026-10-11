import { Spinner, Skeleton, Card, CardBody } from "@heroui/react";

interface LoadingStateProps {
  variant?: "spinner" | "skeleton" | "cards";
  count?: number;
}

export function LoadingState({ variant = "spinner", count = 3 }: LoadingStateProps) {
  if (variant === "spinner") {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" color="primary" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardBody className="flex flex-row gap-4 p-4">
              <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
                <Skeleton className="h-4 w-2/3 rounded-lg" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="w-full">
            <Skeleton className="w-full h-48" />
            <CardBody className="flex flex-col gap-3 p-4">
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
              <Skeleton className="h-4 w-2/3 rounded-lg" />
              <div className="flex justify-between items-center mt-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  return null;
}
