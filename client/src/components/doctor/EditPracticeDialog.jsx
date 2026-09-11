import { useEffect, useState } from "react";
import doctorApi from "../../api/doctorApi";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function EditPracticeDialog({

  open,

  onOpenChange,

  doctor,

  onSuccess,

}) {

  const [form, setForm] = useState({

    hospital: "",

    consultationFee: "",

    biography: "",

    languages: "",

  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (doctor) {

      setForm({

        hospital: doctor.hospital || "",

        consultationFee:
          doctor.consultationFee || "",

        biography:
          doctor.biography || "",

        languages:
          doctor.languages?.join(", ") || "",

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
        {

          ...form,

          languages: form.languages
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),

        }
      );

      onSuccess();

      onOpenChange(false);

    } catch (err) {

      alert(

        err.response?.data?.message ||

        "Update failed"

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

      <DialogContent className="sm:max-w-2xl">

        <DialogHeader>

          <DialogTitle>

            Practice Information

          </DialogTitle>

        </DialogHeader>

        <div className="space-y-5">

          <div>

            <label>

              Hospital

            </label>

            <input

              name="hospital"

              value={form.hospital}

              onChange={handleChange}

              className="w-full border rounded-lg p-3 mt-2"

            />

          </div>

          <div>

            <label>

              Consultation Fee

            </label>

            <input

              type="number"

              name="consultationFee"

              value={form.consultationFee}

              onChange={handleChange}

              className="w-full border rounded-lg p-3 mt-2"

            />

          </div>

          <div>

            <label>

              Languages

            </label>

            <input

              name="languages"

              value={form.languages}

              onChange={handleChange}

              placeholder="English, Hindi, Bengali"

              className="w-full border rounded-lg p-3 mt-2"

            />

          </div>

          <div>

            <label>

              Biography

            </label>

            <textarea

              rows={5}

              name="biography"

              value={form.biography}

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

            {

              loading

                ? "Saving..."

                : "Save"

            }

          </button>

        </DialogFooter>

      </DialogContent>

    </Dialog>

  );

}