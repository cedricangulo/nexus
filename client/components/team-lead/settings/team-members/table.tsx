"use client";

import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  CircleXIcon,
  Columns3Icon,
  ListFilterIcon,
  PlusIcon,
} from "lucide-react";
import { useId, useRef, useState } from "react";
import { deleteUser, restoreUser } from "@/actions/team-members";
import {
  GenericTableBody,
  GenericTableHeader,
} from "@/components/shared/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import type { User } from "@/lib/types/models";
import { cn } from "@/lib/utils";
import { createColumns } from "./columns";
import { InviteMemberModal } from "./invite-modal";

type TeamMembersTableProps = {
  data: User[];
  currentUser: User | null;
};

/**
 * Inline Team Members Filters
 * Handles search and column visibility
 */
function TeamMembersFilters({
  table,
  onAddUser,
}: {
  table: ReturnType<typeof useReactTable<User>>;
  onAddUser: () => void;
}) {
  const filterId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState("");

  const handleClear = () => {
    setSearchValue("");
    table.getColumn("name")?.setFilterValue("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Input
            aria-label="Filter by name, email, or role"
            className={cn("peer min-w-60 ps-9", searchValue && "pe-9")}
            id={`${filterId}-input`}
            onChange={(e) => {
              setSearchValue(e.target.value);
              table.getColumn("name")?.setFilterValue(e.target.value);
            }}
            placeholder="Search by name, email, or role..."
            ref={inputRef}
            type="text"
            value={searchValue}
          />
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <ListFilterIcon aria-hidden="true" size={16} />
          </div>
          {searchValue ? (
            <button
              aria-label="Clear filter"
              className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md text-muted-foreground/80 outline-none transition-[color,box-shadow] hover:text-foreground focus:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleClear}
              type="button"
            >
              <CircleXIcon aria-hidden="true" size={16} />
            </button>
          ) : null}
        </div>

        {/* Column Visibility Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Columns3Icon
                aria-hidden="true"
                className="-ms-1 opacity-60"
                size={16}
              />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  checked={column.getIsVisible()}
                  className="capitalize"
                  key={column.id}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  onSelect={(event) => event.preventDefault()}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Add User Button */}
      <Button onClick={onAddUser}>
        <PlusIcon aria-hidden="true" className="-ms-1 opacity-60" size={16} />
        Invite member
      </Button>
    </div>
  );
}

export function TeamMembersTable({ data, currentUser }: TeamMembersTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [loadingUserIds, setLoadingUserIds] = useState<Set<string>>(new Set());
  const [selfDeleteAlertOpen, setSelfDeleteAlertOpen] = useState(false);

  const withLoading =
    (userId: string, callback: () => Promise<void>) => async () => {
      setLoadingUserIds((prev) => new Set(prev).add(userId));
      try {
        await callback();
      } finally {
        setLoadingUserIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    };

  const handleAction = async (actionId: string, user: User) => {
    if (actionId === "delete") {
      // Validate: prevent deletion of current user's account
      if (currentUser?.id === user.id) {
        setSelfDeleteAlertOpen(true);
        return;
      }
      await withLoading(user.id, async () => {
        await deleteUser(user.id);
      })();
    } else if (actionId === "restore") {
      await withLoading(user.id, async () => {
        await restoreUser(user.id);
      })();
    }
  };

  const columns = createColumns({
    onAction: handleAction,
    loadingUserIds,
    currentUser,
  });

  const table = useReactTable({
    columns,
    data,
    enableSortingRemoval: false,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: { columnFilters, columnVisibility, sorting, pagination },
  });

  return (
    <div className="space-y-4">
      <TeamMembersFilters
        onAddUser={() => {
          setInviteModalOpen(true);
        }}
        table={table}
      />

      <InviteMemberModal
        onOpenChange={setInviteModalOpen}
        onSuccess={(_user) => {
          // Table will be automatically refreshed by revalidatePath from the server action wupwup
        }}
        open={inviteModalOpen}
      />

      <div className="overflow-hidden rounded-md border bg-background">
        <Table className="table-fixed">
          <GenericTableHeader table={table} />
          <GenericTableBody
            emptyMessage="No team members found."
            table={table}
          />
        </Table>
      </div>

      <AlertDialog
        onOpenChange={setSelfDeleteAlertOpen}
        open={selfDeleteAlertOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cannot delete personal account</AlertDialogTitle>
            <AlertDialogDescription>
              Your personal team lead account cannot be deleted. If you need to
              deactivate your role, please contact an administrator.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={() => setSelfDeleteAlertOpen(false)}>
            Understood
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
