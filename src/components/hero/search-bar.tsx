import { Input } from "../ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export const SearchBar = () => {
  return (
    <>
      <Input
        placeholder="Search Surahs, verses, or topics..."
        className="py-5 w-[60%]"
      />
      <Button className="">
        <Search />
      </Button>
    </>
  );
};
