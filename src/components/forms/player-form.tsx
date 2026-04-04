"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createPlayer, updatePlayer } from "@/services/player-actions";
import { POSITIONS } from "@/lib/utils";

interface PlayerFormProps {
  player?: Record<string, unknown>;
}

export function PlayerForm({ player }: PlayerFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const isEditing = !!player;

  const sections = [
    { title: "Identity", description: "Basic player information" },
    { title: "Football Profile", description: "Position and physical attributes" },
    { title: "Contact", description: "Contact and guardian information" },
    { title: "Additional", description: "Notes and metadata" },
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      data[key] = value === "" ? null : value;
    });

    const result = isEditing
      ? await updatePlayer(player!.id as string, data)
      : await createPlayer(data);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push(isEditing ? `/players/${player!.id}` : "/players");
      router.refresh();
    }
  }

  const d = (field: string) => (player?.[field] as string) ?? "";

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      {/* Progress Steps */}
      <div className="mb-6 flex gap-2">
        {sections.map((section, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentSection(i)}
            className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
              currentSection === i ? "border-primary bg-primary/5" : "hover:bg-accent/50"
            }`}
          >
            <p className="text-xs font-medium text-muted-foreground">Step {i + 1}</p>
            <p className="text-sm font-medium">{section.title}</p>
          </button>
        ))}
      </div>

      {/* Section 1: Identity */}
      <div className={currentSection === 0 ? "" : "hidden"}>
        <Card>
          <CardHeader>
            <CardTitle>Identity Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name *</Label>
                <Input id="firstName" name="firstName" defaultValue={d("firstName")} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name *</Label>
                <Input id="lastName" name="lastName" defaultValue={d("lastName")} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of birth</Label>
                <Input id="dateOfBirth" name="dateOfBirth" type="date" defaultValue={d("dateOfBirth")?.split("T")[0]} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select id="gender" name="gender" defaultValue={d("gender")}>
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input id="nationality" name="nationality" placeholder="e.g., Moroccan" defaultValue={d("nationality")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondNationality">Second nationality</Label>
                <Input id="secondNationality" name="secondNationality" defaultValue={d("secondNationality")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationalId">Federation/National ID</Label>
              <Input id="nationalId" name="nationalId" defaultValue={d("nationalId")} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Football Profile */}
      <div className={currentSection === 1 ? "" : "hidden"}>
        <Card>
          <CardHeader>
            <CardTitle>Football Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryPosition">Primary position</Label>
                <Select id="primaryPosition" name="primaryPosition" defaultValue={d("primaryPosition")}>
                  <option value="">Select position</option>
                  {Object.entries(POSITIONS).map(([key, label]) => (
                    <option key={key} value={key}>{label} ({key})</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryPosition">Secondary position</Label>
                <Select id="secondaryPosition" name="secondaryPosition" defaultValue={d("secondaryPosition")}>
                  <option value="">Select position</option>
                  {Object.entries(POSITIONS).map(([key, label]) => (
                    <option key={key} value={key}>{label} ({key})</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredFoot">Preferred foot</Label>
              <Select id="preferredFoot" name="preferredFoot" defaultValue={d("preferredFoot")}>
                <option value="">Select foot</option>
                <option value="RIGHT">Right</option>
                <option value="LEFT">Left</option>
                <option value="BOTH">Both</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input id="height" name="height" type="number" step="0.1" min="50" max="250" defaultValue={d("height")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" name="weight" type="number" step="0.1" min="20" max="200" defaultValue={d("weight")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue={d("status") || "ACTIVE"}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="INJURED">Injured</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="DRAFT">Draft</option>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 3: Contact */}
      <div className={currentSection === 2 ? "" : "hidden"}>
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={d("email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={d("phone")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" defaultValue={d("address")} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" defaultValue={d("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input id="region" name="region" defaultValue={d("region")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" defaultValue={d("country")} />
              </div>
            </div>

            <div className="mt-6 rounded-lg border bg-amber-50/50 p-4">
              <h4 className="text-sm font-semibold text-amber-800">Guardian / Parent (for minors)</h4>
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardianName">Guardian name</Label>
                    <Input id="guardianName" name="guardianName" defaultValue={d("guardianName")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianRelation">Relationship</Label>
                    <Select id="guardianRelation" name="guardianRelation" defaultValue={d("guardianRelation")}>
                      <option value="">Select</option>
                      <option value="PARENT">Parent</option>
                      <option value="GUARDIAN">Guardian</option>
                      <option value="OTHER">Other</option>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="guardianPhone">Guardian phone</Label>
                    <Input id="guardianPhone" name="guardianPhone" defaultValue={d("guardianPhone")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardianEmail">Guardian email</Label>
                    <Input id="guardianEmail" name="guardianEmail" type="email" defaultValue={d("guardianEmail")} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 4: Additional */}
      <div className={currentSection === 3 ? "" : "hidden"}>
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photoUrl">Photo URL</Label>
              <Input id="photoUrl" name="photoUrl" type="url" placeholder="https://..." defaultValue={d("photoUrl")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" rows={4} placeholder="Additional notes about the player..." defaultValue={d("notes")} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
          disabled={currentSection === 0}
        >
          Previous
        </Button>
        <div className="flex gap-2">
          {currentSection < sections.length - 1 ? (
            <Button
              type="button"
              onClick={() => setCurrentSection(currentSection + 1)}
            >
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update Player" : "Create Player"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
