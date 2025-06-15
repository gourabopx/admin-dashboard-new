"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Card } from "@/components/ui/card";
import { Edit2, Trash2 } from "lucide-react";
import {
  createTopbar,
  deleteTopbar,
  getTopbars,
  updateTopbar,
} from "@/app/actions/topbar.actions";
import { toast } from "sonner";

interface Topbar {
  id: string;
  title: string;
  textColor: string;
  backgroundColor: string;
  link: string;
  button?: {
    text: string;
    link: string;
    textColor: string;
    backgroundColor: string;
  };
}

type TopbarInputField =
  | keyof Omit<Topbar, "id">
  | "button.text"
  | "button.link"
  | "button.textColor"
  | "button.backgroundColor";

export default function TopbarPage() {
  const [topbars, setTopbars] = useState<Topbar[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [topbarToDelete, setTopbarToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [newTopbar, setNewTopbar] = useState<Omit<Topbar, "id">>({
    title: "",
    textColor: "#ffffff",
    backgroundColor: "#000000",
    link: "",
    button: undefined,
  });

  const [editingTopbar, setEditingTopbar] = useState<Topbar | null>(null);

  useEffect(() => {
    fetchTopbars();
  }, []);

  const fetchTopbars = async () => {
    const result = await getTopbars();
    if (result.success && result.data) {
      setTopbars(result.data as Topbar[]);
    } else {
      toast.error("Failed to fetch topbars");
    }
  };

  const handleInputChange = (
    field: TopbarInputField,
    value: string | boolean
  ) => {
    setNewTopbar((prev) => {
      if (field === "button" && typeof value === "boolean") {
        return {
          ...prev,
          button: value
            ? {
                text: "",
                link: "",
                textColor: "#000000",
                backgroundColor: "#ffffff",
              }
            : undefined,
        };
      }

      if (field.startsWith("button.") && prev.button) {
        const buttonField = field.split(".")[1] as keyof NonNullable<
          typeof prev.button
        >;
        return {
          ...prev,
          button: {
            ...prev.button,
            [buttonField]: value as string,
          },
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleEditInputChange = (
    field: TopbarInputField,
    value: string | boolean
  ) => {
    if (editingTopbar) {
      setEditingTopbar((prev) => {
        if (!prev) return prev;

        if (field === "button" && typeof value === "boolean") {
          return {
            ...prev,
            button: value
              ? {
                  text: "",
                  link: "",
                  textColor: "#000000",
                  backgroundColor: "#ffffff",
                }
              : undefined,
          };
        }

        if (field.startsWith("button.") && prev.button) {
          const buttonField = field.split(".")[1] as keyof NonNullable<
            typeof prev.button
          >;
          return {
            ...prev,
            button: {
              ...prev.button,
              [buttonField]: value as string,
            },
          };
        }

        return {
          ...prev,
          [field]: value,
        };
      });
    }
  };

  const handleCreateTopbar = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (
        !newTopbar.title ||
        !newTopbar.textColor ||
        !newTopbar.backgroundColor ||
        !newTopbar.link
      ) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (
        newTopbar.button &&
        (!newTopbar.button.text ||
          !newTopbar.button.link ||
          !newTopbar.button.textColor ||
          !newTopbar.button.backgroundColor)
      ) {
        toast.error("Please fill in all button fields");
        return;
      }

      const result = await createTopbar(newTopbar);
      if (result.success) {
        toast.success("Topbar created successfully");
        await fetchTopbars();
        // Reset form
        setNewTopbar({
          title: "",
          textColor: "#ffffff",
          backgroundColor: "#000000",
          link: "",
          button: undefined,
        });
      } else {
        toast.error(result.error || "Failed to create topbar");
      }
    } catch (error) {
      toast.error("An error occurred while creating the topbar");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (topbar: Topbar) => {
    setEditingTopbar(topbar);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (topbarId: string) => {
    setTopbarToDelete(topbarId);
    setIsDeleteDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (editingTopbar) {
      setLoading(true);
      try {
        const result = await updateTopbar({
          id: editingTopbar.id,
          title: editingTopbar.title,
          link: editingTopbar.link,
          textColor: editingTopbar.textColor,
          backgroundColor: editingTopbar.backgroundColor,
          button: editingTopbar.button,
        });

        if (result.success) {
          toast.success("Topbar updated successfully");
          await fetchTopbars();
          setIsEditDialogOpen(false);
          setEditingTopbar(null);
        } else {
          toast.error(result.error || "Failed to update topbar");
        }
      } catch (error) {
        toast.error("An error occurred while updating the topbar");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (topbarToDelete) {
      setLoading(true);
      try {
        const result = await deleteTopbar(topbarToDelete);
        if (result.success) {
          toast.success("Topbar deleted successfully");
          await fetchTopbars();
          setIsDeleteDialogOpen(false);
          setTopbarToDelete(null);
        } else {
          toast.error(result.error || "Failed to delete topbar");
        }
      } catch (error) {
        toast.error("An error occurred while deleting the topbar");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Topbar Management</h1>

      {/* Create Topbar Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Topbar</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Topbar Title*</Label>
            <Input
              id="title"
              value={newTopbar.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Enter topbar title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Topbar Link*</Label>
            <Input
              id="link"
              value={newTopbar.link}
              onChange={(e) => handleInputChange("link", e.target.value)}
              placeholder="Enter topbar link"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="textColor">Text Color*</Label>
            <div className="flex gap-2">
              <Input
                id="textColor"
                type="color"
                value={newTopbar.textColor}
                onChange={(e) => handleInputChange("textColor", e.target.value)}
                className="w-20"
              />
              <Input
                value={newTopbar.textColor}
                onChange={(e) => handleInputChange("textColor", e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backgroundColor">Background Color*</Label>
            <div className="flex gap-2">
              <Input
                id="backgroundColor"
                type="color"
                value={newTopbar.backgroundColor}
                onChange={(e) =>
                  handleInputChange("backgroundColor", e.target.value)
                }
                className="w-20"
              />
              <Input
                value={newTopbar.backgroundColor}
                onChange={(e) =>
                  handleInputChange("backgroundColor", e.target.value)
                }
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="hasButton"
                checked={newTopbar.button !== undefined}
                onCheckedChange={(checked) =>
                  handleInputChange("button", checked)
                }
              />
              <Label htmlFor="hasButton">Add Button</Label>
            </div>
          </div>

          {newTopbar.button && (
            <>
              <div className="space-y-2">
                <Label htmlFor="buttonText">Button Text*</Label>
                <Input
                  id="buttonText"
                  value={newTopbar.button.text}
                  onChange={(e) =>
                    handleInputChange("button.text", e.target.value)
                  }
                  placeholder="Enter button text"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonLink">Button Link*</Label>
                <Input
                  id="buttonLink"
                  value={newTopbar.button.link}
                  onChange={(e) =>
                    handleInputChange("button.link", e.target.value)
                  }
                  placeholder="Enter button link"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonTextColor">Button Text Color*</Label>
                <div className="flex gap-2">
                  <Input
                    id="buttonTextColor"
                    type="color"
                    value={newTopbar.button.textColor}
                    onChange={(e) =>
                      handleInputChange("button.textColor", e.target.value)
                    }
                    className="w-20"
                  />
                  <Input
                    value={newTopbar.button.textColor}
                    onChange={(e) =>
                      handleInputChange("button.textColor", e.target.value)
                    }
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buttonBackgroundColor">
                  Button Background Color*
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="buttonBackgroundColor"
                    type="color"
                    value={newTopbar.button.backgroundColor}
                    onChange={(e) =>
                      handleInputChange(
                        "button.backgroundColor",
                        e.target.value
                      )
                    }
                    className="w-20"
                  />
                  <Input
                    value={newTopbar.button.backgroundColor}
                    onChange={(e) =>
                      handleInputChange(
                        "button.backgroundColor",
                        e.target.value
                      )
                    }
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <Button className="mt-6" onClick={handleCreateTopbar}>
          Create Topbar
        </Button>
      </Card>

      {/* Topbars Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">All Topbars</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Colors</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Button</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topbars.map((topbar) => (
              <TableRow key={topbar.id}>
                <TableCell className="font-medium">{topbar.title}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{
                        backgroundColor: topbar.backgroundColor,
                        borderColor: "gray",
                      }}
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{
                        backgroundColor: topbar.textColor,
                        borderColor: "gray",
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {topbar.link}
                </TableCell>
                <TableCell>
                  {topbar.button ? (
                    <div className="flex items-center gap-2">
                      <span>{topbar.button.text}</span>
                      <div
                        className="w-6 h-6 rounded border"
                        style={{
                          backgroundColor: topbar.button.backgroundColor,
                          borderColor: "gray",
                        }}
                      />
                    </div>
                  ) : (
                    "No button"
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(topbar)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(topbar.id)}
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Topbar</DialogTitle>
            <DialogDescription>
              Make changes to the topbar details below.
            </DialogDescription>
          </DialogHeader>

          {editingTopbar && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Topbar Title*</Label>
                <Input
                  id="edit-title"
                  value={editingTopbar.title}
                  onChange={(e) =>
                    handleEditInputChange("title", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-link">Topbar Link*</Label>
                <Input
                  id="edit-link"
                  value={editingTopbar.link}
                  onChange={(e) =>
                    handleEditInputChange("link", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-textColor">Text Color*</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-textColor"
                    type="color"
                    value={editingTopbar.textColor}
                    onChange={(e) =>
                      handleEditInputChange("textColor", e.target.value)
                    }
                    className="w-20"
                  />
                  <Input
                    value={editingTopbar.textColor}
                    onChange={(e) =>
                      handleEditInputChange("textColor", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-backgroundColor">Background Color*</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-backgroundColor"
                    type="color"
                    value={editingTopbar.backgroundColor}
                    onChange={(e) =>
                      handleEditInputChange("backgroundColor", e.target.value)
                    }
                    className="w-20"
                  />
                  <Input
                    value={editingTopbar.backgroundColor}
                    onChange={(e) =>
                      handleEditInputChange("backgroundColor", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-hasButton"
                    checked={editingTopbar.button !== undefined}
                    onCheckedChange={(checked) =>
                      handleEditInputChange("button", checked)
                    }
                  />
                  <Label htmlFor="edit-hasButton">Add Button</Label>
                </div>
              </div>

              {editingTopbar.button && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edit-buttonText">Button Text*</Label>
                    <Input
                      id="edit-buttonText"
                      value={editingTopbar.button.text}
                      onChange={(e) =>
                        handleEditInputChange("button.text", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-buttonLink">Button Link*</Label>
                    <Input
                      id="edit-buttonLink"
                      value={editingTopbar.button.link}
                      onChange={(e) =>
                        handleEditInputChange("button.link", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-buttonTextColor">
                      Button Text Color*
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-buttonTextColor"
                        type="color"
                        value={editingTopbar.button.textColor}
                        onChange={(e) =>
                          handleEditInputChange(
                            "button.textColor",
                            e.target.value
                          )
                        }
                        className="w-20"
                      />
                      <Input
                        value={editingTopbar.button.textColor}
                        onChange={(e) =>
                          handleEditInputChange(
                            "button.textColor",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-buttonBackgroundColor">
                      Button Background Color*
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-buttonBackgroundColor"
                        type="color"
                        value={editingTopbar.button.backgroundColor}
                        onChange={(e) =>
                          handleEditInputChange(
                            "button.backgroundColor",
                            e.target.value
                          )
                        }
                        className="w-20"
                      />
                      <Input
                        value={editingTopbar.button.backgroundColor}
                        onChange={(e) =>
                          handleEditInputChange(
                            "button.backgroundColor",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </>
              )}
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
            <DialogTitle>Delete Topbar</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this topbar? This action cannot be
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
