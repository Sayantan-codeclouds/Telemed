import { useEffect, useState } from "react";

import doctorApi from "../../api/doctorApi";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

export default function EditPersonalDialog({

    open,

    onOpenChange,

    doctor,

    onSuccess,

}) {

    const [form, setForm] = useState({

        firstName: "",

        lastName: "",

        phone: "",

    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {

        if (doctor) {

            setForm({

                firstName: doctor.firstName || "",

                lastName: doctor.lastName || "",

                phone: doctor.phone || "",

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

            <DialogContent>

                <DialogHeader>

                    <DialogTitle>

                        Edit Personal Information

                    </DialogTitle>

                </DialogHeader>

                <div className="space-y-5">

                    <div>

                        <label>

                            First Name

                        </label>

                        <input

                            name="firstName"

                            value={form.firstName}

                            onChange={handleChange}

                            className="w-full border rounded-lg p-3 mt-2"

                        />

                    </div>

                    <div>

                        <label>

                            Last Name

                        </label>

                        <input

                            name="lastName"

                            value={form.lastName}

                            onChange={handleChange}

                            className="w-full border rounded-lg p-3 mt-2"

                        />

                    </div>

                    <div>

                        <label>

                            Phone

                        </label>

                        <input

                            name="phone"

                            value={form.phone}

                            onChange={handleChange}

                            className="w-full border rounded-lg p-3 mt-2"

                        />

                    </div>

                </div>

                <DialogFooter>

                    <button

                        onClick={handleSubmit}

                        disabled={loading}

                        className="bg-green-600 text-white px-6 py-2 rounded-lg"

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