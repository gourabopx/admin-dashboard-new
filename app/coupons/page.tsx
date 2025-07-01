"use client";

import { useEffect, useState } from "react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  updateCoupon,
} from "../actions/coupon.actions";
import { toast } from "sonner";

interface Coupon {
  id: string;
  coupon: string;
  discount: number;
  startDate: string;
  endDate: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCoupon, setNewCoupon] = useState({
    name: "",
    discount: "",
  });
  const [selectedDateRange, setSelectedDateRange] = useState({
    dateFrom: "2024-01-01",
    dateTo: "2024-12-31",
  });

  // Edit coupon state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Delete coupon state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);

  // Fetch coupons on mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const result = await getAllCoupons();
    if (result.success) {
      setCoupons(result.data ?? []);
    } else {
      toast.error("Failed to fetch coupons");
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCoupon.name || !newCoupon.discount || !selectedDateRange) return;

    const result = await createCoupon({
      coupon: newCoupon.name,
      discount: Number(newCoupon.discount),
      startDate: selectedDateRange.dateFrom,
      endDate: selectedDateRange.dateTo,
    });

    if (result.success) {
      toast.success("Coupon created successfully");
      fetchCoupons();
      setNewCoupon({ name: "", discount: "" });
    } else {
      toast.error("Failed to create coupon");
    }
  };

  const handleEditClick = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (couponId: string) => {
    setCouponToDelete(couponId);
    setIsDeleteDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (editingCoupon) {
      const result = await updateCoupon(editingCoupon.id, {
        coupon: editingCoupon.coupon,
        discount: editingCoupon.discount,
        startDate: editingCoupon.startDate,
        endDate: editingCoupon.endDate,
      });

      if (result.success) {
        toast.success("Coupon updated successfully");
        fetchCoupons();
        setIsEditDialogOpen(false);
        setEditingCoupon(null);
      } else {
        toast.error("Failed to update coupon");
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (couponToDelete) {
      const result = await deleteCoupon(couponToDelete);

      if (result.success) {
        toast.success("Coupon deleted successfully");
        fetchCoupons();
        setIsDeleteDialogOpen(false);
        setCouponToDelete(null);
      } else {
        toast.error("Failed to delete coupon");
      }
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Coupon Management</h1>

      {/* Create Coupon Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Coupon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Coupon Name</label>
            <Input
              placeholder="Enter coupon name"
              value={newCoupon.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewCoupon({ ...newCoupon, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Discount (%)</label>
            <Input
              type="number"
              placeholder="Enter discount percentage"
              value={newCoupon.discount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewCoupon({ ...newCoupon, discount: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Valid Period</label>
            <DateRangePicker
              onUpdate={(values) => {
                if (values.range.from && values.range.to) {
                  setSelectedDateRange({
                    dateFrom: values.range.from.toISOString().split("T")[0],
                    dateTo: values.range.to.toISOString().split("T")[0],
                  });
                }
              }}
              initialDateFrom={selectedDateRange.dateFrom}
              initialDateTo={selectedDateRange.dateTo}
              align="start"
              locale="en-GB"
              showCompare={false}
            />
          </div>
          <Button onClick={handleCreateCoupon}>Create Coupon</Button>
        </div>
      </Card>

      {/* Coupons Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">All Coupons</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Coupon Name</TableHead>
              <TableHead>Discount (%)</TableHead>
              <TableHead>Valid From</TableHead>
              <TableHead>Valid To</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell className="font-medium">{coupon.coupon}</TableCell>
                <TableCell>{coupon.discount}%</TableCell>
                <TableCell>{coupon.startDate}</TableCell>
                <TableCell>{coupon.endDate}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => handleEditClick(coupon)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteClick(coupon.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Make changes to the coupon details below.
            </DialogDescription>
          </DialogHeader>
          {editingCoupon && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Coupon Name</label>
                <Input
                  value={editingCoupon.coupon}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      coupon: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Discount (%)</label>
                <Input
                  type="number"
                  value={editingCoupon.discount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditingCoupon({
                      ...editingCoupon,
                      discount: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valid Period</label>
                <DateRangePicker
                  onUpdate={(values) => {
                    if (values.range.from && values.range.to) {
                      setEditingCoupon({
                        ...editingCoupon,
                        startDate: values.range.from
                          .toISOString()
                          .split("T")[0],
                        endDate: values.range.to.toISOString().split("T")[0],
                      });
                    }
                  }}
                  initialDateFrom={editingCoupon.startDate}
                  initialDateTo={editingCoupon.endDate}
                  align="start"
                  locale="en-GB"
                  showCompare={false}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this coupon? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
