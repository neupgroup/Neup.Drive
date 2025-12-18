import type { FileOrFolder } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FileIcon } from '@/components/file-icon';
import { Card } from '@/components/ui/card';

export function FileListView({ data }: { data: FileOrFolder[] }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[350px]">Name</TableHead>
            <TableHead>Members</TableHead>
            <TableHead className="hidden md:table-cell">Last Modified</TableHead>
            <TableHead className="text-right">File Size</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <FileIcon type={item.type} className="h-5 w-5 text-muted-foreground" />
                  <span>{item.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {item.members.map((member, index) => (
                    <TooltipProvider key={member.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className={`h-7 w-7 border-2 border-background ${index > 0 ? '-ml-2' : ''}`}>
                            <AvatarImage src={member.avatar.imageUrl} alt={member.name} data-ai-hint={member.avatar.imageHint}/>
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{member.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{item.lastModified}</TableCell>
              <TableCell className="text-right">{item.size || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
