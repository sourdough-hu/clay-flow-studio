import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ClayType, PotteryForm, Stage } from "@/types";

export interface FilterValue {
  type: "stage" | "size" | "clayType";
  value: string;
  label: string;
}

interface FilterBottomSheetProps {
  activeFilters: FilterValue[];
  onFiltersChange: (filters: FilterValue[]) => void;
  hideStage?: boolean;
}

const stageOptions: Stage[] = ["throwing","trimming","drying","bisque_firing","glazing","glaze_firing","finished"];
const formOptions: PotteryForm[] = ["Mug / Cup", "Bowl", "Vase", "Plate", "Pitcher", "Teapot", "Sculpture", "Others"];
const clayTypeOptions: ClayType[] = ["Stoneware","Porcelain","Earthenware","Terracotta","Speckled Stoneware","Nerikomi","Recycled / Mixed","Others"];

const formatStage = (stage: string) => stage.replace("_"," ").charAt(0).toUpperCase() + stage.replace("_"," ").slice(1);

export function FilterBottomSheet({ activeFilters, onFiltersChange, hideStage = false }: FilterBottomSheetProps) {
  const [open, setOpen] = useState(false);
  const [selectedFilterType, setSelectedFilterType] = useState<"stage" | "size" | "clayType" | null>(null);

  const addFilter = (type: "stage" | "size" | "clayType", value: string, label: string) => {
    // Check if filter already exists
    const exists = activeFilters.some(f => f.type === type && f.value === value);
    if (exists) return;

    const newFilter: FilterValue = { type, value, label };
    onFiltersChange([...activeFilters, newFilter]);
    setSelectedFilterType(null);
  };

  const removeFilter = (filterToRemove: FilterValue) => {
    onFiltersChange(activeFilters.filter(f => !(f.type === filterToRemove.type && f.value === filterToRemove.value)));
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
    setOpen(false);
  };

  return (
    <>
      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {activeFilters.map((filter, idx) => (
            <Badge key={`${filter.type}-${filter.value}`} variant="secondary" className="flex items-center gap-1">
              {filter.type === "stage" && "Stage: "}{filter.type === "size" && "Size: "}{filter.type === "clayType" && "Clay: "}{filter.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter(filter)}
              />
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        </div>
      )}

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-full flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilters.length > 0 && (
              <Badge variant="default" className="ml-1 text-xs">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            {!selectedFilterType ? (
              <>
                <h3 className="font-medium">Add filter</h3>
                <div className="grid grid-cols-1 gap-2">
                  {!hideStage && (
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedFilterType("stage")}
                      className="justify-start"
                    >
                      Stage
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedFilterType("size")}
                    className="justify-start"
                  >
                    Size
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedFilterType("clayType")}
                    className="justify-start"
                  >
                    Clay Type
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">
                    Select {selectedFilterType === "clayType" ? "Clay Type" : selectedFilterType}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedFilterType(null)}>
                    Back
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {selectedFilterType === "stage" && stageOptions.map((option) => (
                    <Button
                      key={option}
                      variant="outline"
                      onClick={() => addFilter("stage", option, formatStage(option))}
                      className="justify-start"
                    >
                      {formatStage(option)}
                    </Button>
                  ))}
                  {selectedFilterType === "size" && formOptions.map((option) => (
                    <Button
                      key={option}
                      variant="outline"
                      onClick={() => addFilter("size", option, option)}
                      className="justify-start"
                    >
                      {option}
                    </Button>
                  ))}
                  {selectedFilterType === "clayType" && clayTypeOptions.map((option) => (
                    <Button
                      key={option}
                      variant="outline"
                      onClick={() => addFilter("clayType", option, option)}
                      className="justify-start"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </>
            )}
            
            {activeFilters.length > 0 && (
              <Button variant="outline" onClick={clearAllFilters} className="w-full mt-4">
                Clear all filters
              </Button>
            )}
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}