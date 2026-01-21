// components/restaurants/restaurants-table.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2, ExternalLink, MapPin } from 'lucide-react';
import { toast } from 'sonner';

import { type RestaurantListItem } from '@/lib/validations/restaurant';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { deleteRestaurantAction } from '@/lib/actions/restaurant';

/**
 * 🎯 Tableau de restaurants avec TanStack Table
 * 
 * Fonctionnalités :
 * - Tri par colonne
 * - Filtrage par nom
 * - Actions par ligne (éditer, supprimer)
 * - Confirmation de suppression
 * - Optimistic UI avec useTransition
 */

interface RestaurantsTableProps {
  restaurants: RestaurantListItem[];
  userId: string;
}

export function RestaurantsTable({ restaurants, userId }: RestaurantsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<RestaurantListItem | null>(null);

  // Définition des colonnes
  const columns: ColumnDef<RestaurantListItem>[] = [
    {
      accessorKey: 'name',
      header: 'Nom',
      cell: ({ row }) => {
        const restaurant = row.original;
        return (
          <div className="flex flex-col">
            <Link
              href={`/restaurants/${restaurant.id}`}
              className="font-medium hover:underline"
            >
              {restaurant.name}
            </Link>
            <span className="text-xs text-muted-foreground">
              {restaurant.slug}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'city',
      header: 'Localisation',
      cell: ({ row }) => {
        const { city, country } = row.original;
        if (!city && !country) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>
              {[city, country].filter(Boolean).join(', ')}
            </span>
          </div>
        );
      },
    },
    {
      id: 'counts',
      header: 'Contenu',
      cell: ({ row }) => {
        const { _count } = row.original;
        return (
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {_count.menus} menu{_count.menus > 1 ? 's' : ''}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {_count.dishes} plat{_count.dishes > 1 ? 's' : ''}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Créé',
      cell: ({ row }) => {
        const date = row.original.createdAt;
        return (
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(date), {
              addSuffix: true,
              locale: fr,
            })}
          </span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const restaurant = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/restaurants/${restaurant.id}/edit`)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(restaurant.id);
                  toast.success('ID copié');
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Copier l'ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setRestaurantToDelete(restaurant);
                  setDeleteDialogOpen(true);
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Configuration de la table
  const table = useReactTable({
    data: restaurants,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  // Gestion de la suppression
  const handleDelete = async () => {
    if (!restaurantToDelete) return;

    startTransition(async () => {
      const result = await deleteRestaurantAction(restaurantToDelete.id);

      if (!result.success) {
        toast.error('Erreur', {
          description: result.error.message,
        });
        return;
      }

      toast.success('Restaurant supprimé', {
        description: `${restaurantToDelete.name} a été archivé`,
      });

      setDeleteDialogOpen(false);
      setRestaurantToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      {/* Filtres */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Rechercher un restaurant..."
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point d'archiver{' '}
              <strong>{restaurantToDelete?.name}</strong>. Le restaurant sera
              masqué mais les données seront conservées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isPending}
            >
              {isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
