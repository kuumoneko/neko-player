import { goto } from "@/lib/url";
import ControlPanel from "./Controls";
import ControlPages from "./Pages";
import Account from "./Account";

export default function Nav({ seturl }: { seturl: (url: string) => void }) {
    return (
        <div className="w-[80%] h-[5%] bg-slate-700 rounded-4xl flex flex-row items-center justify-between px-4">
            <ControlPanel seturl={seturl} />
            <ControlPages seturl={seturl} />
            <Account seturl={seturl} />
        </div>
    );
}
