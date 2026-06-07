import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/icons';
import { NavLinks } from '@/components/prodrive/nav-links';

export function Sidebar() {
  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] z-0 hidden w-64 flex-col border-r bg-white sm:flex">
      <nav className="flex flex-col gap-4 p-4 sm:py-5">
        <Button className="font-semibold" size="lg" asChild>
          <Link href="/upload">
            <PlusCircle className="mr-2 h-5 w-5" />
            New
          </Link>
        </Button>
        <NavLinks />
      </nav>
      <div className="mt-auto flex flex-col gap-4 p-4">
        <Card className="bg-background">
          <CardHeader className="p-2 pt-0 md:p-4">
            <CardTitle className="text-base font-medium">Storage</CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
            <div className="text-center text-sm text-muted-foreground">
              <span className="font-bold">12.5 GB</span> of 50 GB used
            </div>
            <Progress value={25} aria-label="25% storage used" className="mt-2" />
          </CardContent>
          <CardFooter className="p-2 pt-0 md:p-4">
            <Button size="sm" className="w-full">
              Upgrade Storage
            </Button>
          </CardFooter>
        </Card>
        <Separator />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-auto items-center justify-start gap-2 p-1">
              <Avatar className="h-9 w-9 border">
                <AvatarImage src="https://picsum.photos/seed/101/40/40" alt="Avatar" data-ai-hint="person face" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="font-medium">Admin</div>
                <div className="text-xs text-muted-foreground">admin@prodrive.io</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>My Account</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
