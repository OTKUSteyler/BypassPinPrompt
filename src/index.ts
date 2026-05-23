import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

const MessageActions = findByProps("pinMessage", "unpinMessage");

let patches: (() => void)[] = [];

function findConfirmModule() {
    const modules = (globalThis as any).__r?.modules;
    if (!modules) return null;

    for (const id in modules) {
        try {
            const mod = modules[id]?.publicModule?.exports;
            if (!mod || typeof mod !== "object") continue;

            const keys = Object.keys(mod).filter(k => typeof k === "string");
            for (const key of keys) {
                try {
                    const val = mod[key];
                    if (typeof val === "object" && val !== null) {
                        if (typeof val.confirmPin === "function" || typeof val.confirmUnpin === "function") {
                            return val;
                        }
                    }
                    if (typeof val === "function") {
                        const src = Function.prototype.toString.call(val);
                        if (src.includes("confirmPin") || src.includes("confirmUnpin")) {
                            return mod;
                        }
                    }
                } catch {}
            }
        } catch {}
    }
    return null;
}

export default {
    name: "BypassPinPrompt",
    description: "Bypass the confirmation prompt when pinning or unpinning messages.",
    authors: [
        { name: "btmc727 (ported)" },
        { name: "thororen (original)" },
    ],

    onLoad() {
        if (!MessageActions) return;

        const confirmMod = findConfirmModule();
        if (!confirmMod) return;

        if (confirmMod.confirmPin) {
            patches.push(
                instead("confirmPin", confirmMod, ([channel, message]) => {
                    MessageActions.pinMessage(channel, message.id);
                })
            );
        }

        if (confirmMod.confirmUnpin) {
            patches.push(
                instead("confirmUnpin", confirmMod, ([channel, message]) => {
                    MessageActions.unpinMessage(channel, message.id);
                })
            );
        }
    },

    onUnload() {
        patches.forEach(p => p());
        patches = [];
    },
};
