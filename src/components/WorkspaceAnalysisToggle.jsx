import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WorkspaceAnalysisToggle({ minimized, onToggle }) {
  const Icon = minimized ? PanelRightOpen : PanelRightClose;

  return (
    <div className="workspace__analysis-bar">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onToggle}
        aria-expanded={!minimized}
        aria-controls="analysis-panel"
      >
        <Icon aria-hidden="true" data-icon="inline-start" />
        {minimized ? "Show analysis" : "Hide analysis"}
      </Button>
    </div>
  );
}
