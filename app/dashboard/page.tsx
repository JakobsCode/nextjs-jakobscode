import {
    Map,
    MapTileLayer,
    MapZoomControl,
    MapLocateControl,
} from "@/components/ui/map"
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SettingsDialog } from "@/components/settings-dialog";
import DeviceMarker from "@/components/device-marker";

export default async function Dashboard() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/sign-in");
    }

    return (
        <div className="font-sans flex flex-col min-h-screen">
            <main className="flex flex-col gap-2 items-start flex-grow w-full">
                <Map center={[50.733602, 7.093770]} className="flex-grow w-full">
                    <MapTileLayer />
                    <div className="absolute top-1 left-1 z-1000 grid gap-1">
                        <MapLocateControl className="static" />
                        <SettingsDialog />
                        <MapZoomControl className="static" />
                        <DeviceMarker />
                    </div>
                </Map>
            </main>
        </div>
    );
}
