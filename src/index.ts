import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

const MessageActions = findByProps("pinMessage", "unpinMessage");

let patches: (() => void)[] = [];

function findConfirmModule() {
    const modules = window.modules ?? (globalThis as any).__r?.modules;
    if (!modules) return null;

    for (const id in modules) {
        const mod = modules[id]?.publicModule?.exports;
        if (!mod) continue;
        for (const key of Object.keys(mod)) {
            if (typeof mod[key] === "object" && mod[key] !== null) {
                const sub = mod[key];
                if (typeof sub.confirmPin === "function" || typeof sub.confirmUnpin === "function") {
                    return sub;
                }
            }
            if (typeof mod[key] === "function") {
                const src = mod[key].toString();
                if (src.includes("confirmPin") || src.includes("confirmUnpin")) {
                    return mod;
                }
            }
        }
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
