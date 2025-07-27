
'use client';

import {
  BookCopy,
  LayoutDashboard,
  Paintbrush,
  PenSquare,
  School,
  FileText,
  Library,
  PanelLeft,
  Settings,
  ChevronsUpDown,
  Check,
  Languages,
  LogOut,
  Moon,
  Sun,
  PanelLeftClose,
  PanelRightClose,
  CalendarDays,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useGrade } from '@/context/grade-context';
import { useLocale, useTranslations } from '@/context/locale-context';
import { useSubject } from '@/context/subject-context';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState, createContext, useContext, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '../ui/sheet';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '../ui/dropdown-menu';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/auth-context';
import { signOut } from '@/app/auth/actions';
import { useToast } from '@/hooks/use-toast';


type SidebarContextType = {
  isExpanded: boolean;
  toggle: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  const toggle = () => {
    setIsExpanded(!isExpanded);
  };
  
  const value = useMemo(() => ({ isExpanded, toggle }), [isExpanded]);

  return (
    <SidebarContext.Provider value={value}>
        <TooltipProvider delayDuration={0}>
            {children}
        </TooltipProvider>
    </SidebarContext.Provider>
  );
};


function SidebarMenuItem({
  icon,
  text,
  href,
  isActive,
}: {
  icon: React.ReactNode;
  text: string;
  href: string;
  isActive: boolean;
}) {
  const { isExpanded } = useSidebar();
  return (
     <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-primary text-sm',
              isActive && 'bg-primary/10 text-primary',
              !isExpanded && 'justify-center'
            )}
          >
            {icon}
            {isExpanded && <span className="truncate">{text}</span>}
          </Link>
        </TooltipTrigger>
        {!isExpanded && (
             <TooltipContent side="right">
                {text}
            </TooltipContent>
        )}
    </Tooltip>
  );
}

export function AppSidebarContainer({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile();
    const { isExpanded, toggle } = useSidebar();

    if(isMobile) {
        return (
            <div className="flex flex-col h-full">
                <header className="flex h-14 items-center gap-4 bg-muted/40 px-4 shrink-0">
                    <Sheet open={isExpanded} onOpenChange={toggle}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <PanelLeft className="h-5 w-5" />
                                <span className="sr-only">Toggle sidebar</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="flex flex-col p-0 w-72">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Sidebar</SheetTitle>
                                <SheetDescription>
                                    Main navigation and settings
                                </SheetDescription>
                            </SheetHeader>
                            <AppSidebar />
                        </SheetContent>
                    </Sheet>
                     <div className="w-full flex-1">
                       {/* Mobile Header Content can go here */}
                     </div>
                </header>
                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        )
    }

    return (
        <div className="grid min-h-0 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr] h-full">
            <aside
                className={cn(
                    'hidden md:flex flex-col bg-muted/40 transition-all duration-300',
                    isExpanded ? 'w-64' : 'w-[72px]'
                )}
            >
                <AppSidebar />
            </aside>
            <div className="flex flex-col overflow-auto">
                <main className="flex-1 overflow-auto">{children}</main>
            </div>
        </div>
    );
};

function ManageSubjectsDialog({ grade, children }: { grade: string, children: React.ReactNode }) {
  const { subjectsByGrade, addSubject, removeSubject } = useSubject();
  const [newSubject, setNewSubject] = useState('');
  const t = useTranslations();

  const handleAddSubject = () => {
    if (newSubject.trim() && grade) {
      addSubject(grade, newSubject.trim());
      setNewSubject('');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('manageSubjects')} for {t(grade.replace(/\s+/g, '')) || grade}</DialogTitle>
          <DialogDescription>{t('manageSubjectsDesc')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="new-subject" className="sr-only">{t('newSubject')}</Label>
            <Input
              id="new-subject"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder={t('newSubjectPlaceholder')}
            />
            <Button onClick={handleAddSubject}>{t('add')}</Button>
          </div>
          <div className="space-y-2">
            <Label>{t('existingSubjects')}</Label>
            <div className="max-h-48 overflow-y-auto space-y-2 rounded-md border p-2">
              {(subjectsByGrade[grade] || []).map(subject => (
                <div key={subject} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span>{t(subject) || subject}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeSubject(grade, subject)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('done')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ManageGradesDialog({ children }: { children: React.ReactNode }) {
  const { grades, addGrade, removeGrade } = useGrade();
  const [newGrade, setNewGrade] = useState('');
  const t = useTranslations();

  const handleAddGrade = () => {
    if (newGrade.trim()) {
      addGrade(newGrade.trim());
      setNewGrade('');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('manageGrades')}</DialogTitle>
          <DialogDescription>{t('manageGradesDesc')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="new-grade" className="sr-only">{t('newGrade')}</Label>
            <Input
              id="new-grade"
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value)}
              placeholder={t('newGradePlaceholder')}
            />
            <Button onClick={handleAddGrade}>{t('add')}</Button>
          </div>
          <div className="space-y-2">
            <Label>{t('existingGrades')}</Label>
            <div className="max-h-48 overflow-y-auto space-y-2 rounded-md border p-2">
              {grades.map(grade => (
                <div key={grade} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <span>{t(grade.replace(/\s+/g, '')) || grade}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeGrade(grade)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('done')}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function WorkspaceSwitcher() {
  const { selectedGrade } = useGrade();
  const { selectedSubject, setSelectedSubjectByGrade, subjectsByGrade } = useSubject();
  const { grades } = useGrade();
  const t = useTranslations();
  const { isExpanded } = useSidebar();

  const selectedGradeText = t(selectedGrade.replace(/\s+/g, '')) || selectedGrade;

  if (!isExpanded) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
            <div className="flex flex-col items-center gap-2 py-2">
                <School className="h-6 w-6" />
            </div>
        </TooltipTrigger>
        <TooltipContent side="right">
            <p>{selectedGradeText}</p>
            <p className="font-semibold">{t(selectedSubject) || selectedSubject}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-auto py-2"
          >
            <div className="flex items-center gap-2">
              <School className="h-5 w-5" />
              <div className="flex flex-col items-start text-left">
                  <span className='text-sm font-semibold line-clamp-1'>{selectedGradeText}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">{t(selectedSubject) || selectedSubject}</span>
              </div>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
          <DropdownMenuLabel>{t('switchGradeSubject')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
           <DropdownMenuGroup>
            {grades.map((grade) => (
              <DropdownMenuSub key={grade}>
                <DropdownMenuSubTrigger>
                  <span>{t(grade.replace(/\s+/g, '')) || grade}</span>
                  {selectedGrade === grade && <div className="w-2 h-2 rounded-full bg-primary ml-auto" />}
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                     <DropdownMenuRadioGroup 
                        value={selectedGrade === grade ? selectedSubject : ''} 
                        onValueChange={(subject) => setSelectedSubjectByGrade(grade, subject)}
                     >
                       {(subjectsByGrade[grade] || []).map((subject) => (
                          <DropdownMenuRadioItem key={subject} value={subject}>
                            {t(subject) || subject}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    <ManageSubjectsDialog grade={grade}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t('manageSubjects')}</span>
                      </DropdownMenuItem>
                    </ManageSubjectsDialog>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            ))}
          </DropdownMenuGroup>
           <DropdownMenuSeparator />
          <ManageGradesDialog>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('manageGrades')}</span>
            </DropdownMenuItem>
          </ManageGradesDialog>
        </DropdownMenuContent>
      </DropdownMenu>
  )
}

function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    const t = useTranslations();
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">{t('toggleTheme')}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    {t('light')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    {t('dark')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    {t('system')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function UserMenu() {
    const { isExpanded } = useSidebar();
    const t = useTranslations();
    const { locale, setLocale, locales } = useLocale();
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = async () => {
        const result = await signOut();
        if (result.success) {
            toast({ title: 'Logged out successfully' });
            router.push('/login');
        } else {
            toast({ variant: 'destructive', title: 'Logout failed', description: result.message });
        }
    };

    return (
        <DropdownMenu>
            <Tooltip>
                 <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={cn("w-full h-auto", isExpanded ? "justify-start p-2" : "justify-center p-2")}>
                           <div className='flex items-center gap-3'>
                                <Avatar className={cn(isExpanded ? 'h-8 w-8' : 'h-8 w-8')}>
                                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || "User"} />
                                    <AvatarFallback>{user?.displayName?.[0] || user?.email?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                {isExpanded && (
                                    <div className="flex flex-col items-start overflow-hidden">
                                        <span className="font-semibold text-sm truncate">{user?.displayName || t('teacherName')}</span>
                                        <span className="text-xs text-muted-foreground truncate">{user?.email || t('teacherTitle')}</span>
                                    </div>
                                )}
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                {!isExpanded && <TooltipContent side="right">{user?.displayName || t('teacherName')}</TooltipContent>}
            </Tooltip>
            <DropdownMenuContent side="right" align="start" className="w-56">
                <DropdownMenuLabel>{user?.displayName || t('teacherName')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                     <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Languages className="mr-2 h-4 w-4" />
                            <span>{t('language')}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                             <DropdownMenuSubContent>
                                {Object.entries(locales).map(([code, name]) => (
                                    <DropdownMenuItem key={code} onSelect={() => setLocale(code)}>
                                        {name}
                                        <Check className={cn('ml-auto h-4 w-4', locale === code ? 'opacity-100' : 'opacity-0')} />
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t('settings')}</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('logout')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const { isExpanded, toggle } = useSidebar();
  const isMobile = useIsMobile();

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === path || pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col h-full">
      <div className={cn("flex h-14 items-center", isExpanded ? "px-4" : "px-2 justify-center")}>
        <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
          <School className="h-6 w-6" />
          {isExpanded && <span className="">Sahayak</span>}
        </Link>
         {!isMobile && (
             <Button variant="ghost" size="icon" className="ml-auto" onClick={toggle}>
                {isExpanded ? <PanelLeftClose className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
                 <span className="sr-only">{t('toggleSidebar')}</span>
             </Button>
         )}
      </div>
      
      <div className={cn('flex flex-col flex-1 overflow-y-auto', isExpanded ? 'p-2' : 'p-2')}>
            <div className='flex-1'>
                 <div className="p-1 pb-2">
                    <WorkspaceSwitcher />
                 </div>
                <nav className="grid items-start gap-1 font-medium">
                  <SidebarMenuItem
                    href="/dashboard"
                    icon={<LayoutDashboard className="h-4 w-4" />}
                    text={t('dashboard')}
                    isActive={isActive('/dashboard')}
                  />
                   <SidebarMenuItem
                    href="/planner"
                    icon={<CalendarDays className="h-4 w-4" />}
                    text={t('planner')}
                    isActive={isActive('/planner')}
                  />
                  <SidebarMenuItem
                    href="/curriculum-guide"
                    icon={<BookCopy className="h-4 w-4" />}
                    text={t('curriculumGuide')}
                    isActive={isActive('/curriculum-guide')}
                  />
                  <SidebarMenuItem
                    href="/content-generator"
                    icon={<PenSquare className="h-4 w-4" />}
                    text={t('contentGenerator')}
                    isActive={isActive('/content-generator')}
                  />
                  <SidebarMenuItem
                    href="/summarize"
                    icon={<FileText className="h-4 w-4" />}
                    text={t('summarizeDocuments')}
                    isActive={isActive('/summarize')}
                  />
                  <SidebarMenuItem
                    href="/whiteboard"
                    icon={<Paintbrush className="h-4 w-4" />}
                    text={t('digitalWhiteboard')}
                    isActive={isActive('/whiteboard')}
                  />
                  <SidebarMenuItem
                    href="/knowledge-base"
                    icon={<Library className="h-4 w-4" />}
                    text={t('knowledgeBase')}
                    isActive={isActive('/knowledge-base')}
                  />
                </nav>
            </div>

            <div className="mt-auto">
                 <div className="my-2" />
                 <div className={cn("flex items-center", isExpanded ? "justify-between" : "justify-center flex-col-reverse gap-2")}>
                    <UserMenu />
                    <ThemeToggle />
                 </div>
            </div>
      </div>
    </div>
  );
}
