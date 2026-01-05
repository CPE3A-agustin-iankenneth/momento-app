import { 
  Sidebar, 
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader, 
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Search } from "lucide-react";
import SearchDialog from "@/components/search-dialog";
import { Button } from "@/components/ui/button";


const views = [
  {
    title: "daily",
    href: "/",
  },
  {
    title: "calendar",
    href: "/calendar"
  },
  {
    title: "gallery",
    href: "/gallery"
  },
  {
    title: "dashboard",
    href: "/dashboard"
  }

]

export default function AppSidebar() {

  return (
    <Sidebar>
        <SidebarContent className="p-4">
          <SidebarHeader>
            <h1 className="text-3xl text-balance">momento</h1>
          </SidebarHeader>
          <SidebarGroup>
            <SidebarGroupContent>
              <SearchDialog 
                trigger={
                  <Button variant="outline" className="w-full justify-start gap-2 text-muted-foreground">
                    <Search className="h-4 w-4" />
                    Search entries...
                  </Button>
                }
              />
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel className="font-bold tracking-widest text-sidebar-foreground/50">CHANGE VIEW</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {views.map((view) => (
                  <SidebarMenuItem key={view.title}>
                    <SidebarMenuButton className="text-xl py-6 mb-2 hover:bg-secondary transition-all duration-75" asChild>
                      <Link href={view.href}>{view.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
    </Sidebar>
  )
}

