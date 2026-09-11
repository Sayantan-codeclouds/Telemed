import { useEffect, useState } from "react";
import doctorApi from "../../api/doctorApi";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function EditProfessionalDialog({

  open,

  onOpenChange,

  doctor,

  onSuccess,

}) {

  const [form, setForm] = useState({

    specialization: "",

    qualification: "",

    experience: "",

    licenseNumber: "",

  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (doctor) {

      setForm({

        specialization:
          doctor.specialization || "",

        qualification:
          doctor.qualification || "",

        experience:
          doctor.experience || "",

        licenseNumber:
          doctor.licenseNumber || "",

      });

    }

  }, [doctor]);

  const handleChange = (e) => {

    setForm({

      ...form,

      [e.target.name]: e.target.value,

    });

  };

  const handleSubmit = async () => {

    try {

      setLoading(true);

      await doctorApi.put(
        "/doctors/profile",
        form
      );

      onSuccess();

      onOpenChange(false);

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Update failed."
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >

      <DialogContent className="sm:max-w-xl">

        <DialogHeader>

          <DialogTitle>

            Edit Professional Information

          </DialogTitle>

        </DialogHeader>

        <div className="space-y-5">

          <div>

            <label className="font-medium">

              Specialization

            </label>

            <input
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 mt-2"
            />

          </div>

          <div>

            <label className="font-medium">

              Qualification

            </label>

            <input
              name="qualification"
              value={form.qualification}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 mt-2"
            />

          </div>

          <div>

            <label className="font-medium">

              Experience (Years)

            </label>

            <input
              type="number"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 mt-2"
            />

          </div>

          <div>

            <label className="font-medium">

              License Number

            </label>

            <input
              name="licenseNumber"
              value={form.licenseNumber}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 mt-2"
            />

          </div>

        </div>

        <DialogFooter>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
          >

            {loading ? "Saving..." : "Save"}

          </button>

        </DialogFooter>

      </DialogContent>

    </Dialog>

  );

}