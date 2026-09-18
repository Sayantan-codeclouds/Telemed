import { useState } from "react";
import doctorApi from "../../api/doctorApi";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function EditAddressDialog({

  open,

  onOpenChange,

  doctor,

  onSuccess,

}) {

  const emptyAddress = {
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  };

  const [form, setForm] = useState(() =>
    doctor ? { ...emptyAddress, ...doctor.address } : emptyAddress
  );
  // Tracks the doctor this form was last seeded from, so switching to a
  // different doctor resets the form during render instead of via an effect.
  const [seededFrom, setSeededFrom] = useState(doctor);

  if (doctor !== seededFrom) {
    setSeededFrom(doctor);
    setForm(doctor ? { ...emptyAddress, ...doctor.address } : emptyAddress);
  }

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    setForm({

      ...form,

      [e.target.name]: e.target.value,

    });

  };

  const handleSubmit = async () => {

    try {

      setLoading(true);

      await doctorApi.put("/doctors/profile", {

        address: form,

      });

      onSuccess();

      onOpenChange(false);

    }

    catch (err) {

      alert(

        err.response?.data?.message ||

        "Update failed"

      );

    }

    finally {

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

            Edit Address

          </DialogTitle>

        </DialogHeader>

        <div className="grid grid-cols-2 gap-5">

          <div>

            <label>Address Line 1</label>

            <input

              name="line1"

              value={form.line1}

              onChange={handleChange}

              className="w-full border rounded-lg p-3 mt-2"

            />

          </div>

          <div>

            <label>Address Line 2</label>

            <input

              name="line2"

              value={form.line2}

              onChange={handleChange}

              className="w-full border rounded-lg p-3 mt-2"

            />

          </div>

          <div>

            <label>City</label>

            <input

              name="city"

              value={form.city}

              onChange={handleChange}

              className="w-full border rounded-lg p-3 mt-2"

            />

          </div>

          <div>

            <label>State</label>

            <input

              name="state"

              value={form.state}

              onChange={handleChange}

              className="w-full border rounded-lg p-3 mt-2"

            />

          </div>

          <div>

            <label>Country</label>

            <input

              name="country"

              value={form.country}

              onChange={handleChange}

              className="w-full border rounded-lg p-3 mt-2"

            />

          </div>

          <div>

            <label>Pincode</label>

            <input

              name="pincode"

              value={form.pincode}

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