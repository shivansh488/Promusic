import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ErrorStateProps = {
  error: Error | unknown;
};

export const ErrorState = ({ error }: ErrorStateProps) => {
  return (
    <div className="p-8">
      <Alert className="max-w-2xl mb-6 bg-[#2a2a2a] border-none">
        <AlertTitle className="text-lg">Error Loading Music</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "There was an error loading the music content. Please try again later."}
        </AlertDescription>
      </Alert>
    </div>
  );
};