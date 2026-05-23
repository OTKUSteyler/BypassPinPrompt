import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

const Alerts = findByProps("alertWithButtons");

let patches: (() => void)[] = [];

export default {
    name: "BypassPinPrompt",
    description: "Bypass the confirmation prompt when pinning or unpinning messages.",
    authors: [
        { name: "btmc727 (ported)" },
        { name: "thororen (original)" },
    ],

    onLoad() {
        if (!Alerts) return;

        patches.push(
            instead("alertWithButtons", Alerts, (args, orig) => {
                const alert = args[0];
                const buttons = args[1] ?? [];
                const confirmButton = buttons.find((b: any) => b.style === "default" || b.preferred);
                if (confirmButton?.onPress) {
                    confirmButton.onPress();
                    return;
                }
                return orig(...args);
            })
        );
    },

    onUnload() {
        patches.forEach(p => p());
        patches = [];
    },
};
