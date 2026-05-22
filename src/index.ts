import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

// Find the module that actually makes the API call
const MessageActions = findByProps("pinMessage", "unpinMessage");

// Find the alert/dialog module — on mobile it's usually shown via this
const Alerts = findByProps("show", "close", "openLazy");

let patches: (() => void)[] = [];

export default {
    name: "BypassPinPrompt",
    description: "Bypass the confirmation prompt when pinning or unpinning messages.",
    authors: [{ name: "thororen (ported)" }],

    onLoad() {
        if (!MessageActions) return;

        // Intercept the alert show — if it's a pin/unpin alert, skip it and act directly
        if (Alerts) {
            patches.push(
                instead("show", Alerts, (args, orig) => {
                    const alert = args[0];
                    const title: string = alert?.title ?? "";

                    if (title === "Pin Message" || title === "Unpin Message") {
                        // Find and call the confirm action directly
                        const confirmAction = alert?.confirmText
                            ? alert?.onConfirm ?? alert?.actions?.find((a: any) => a.preferred)?.onPress
                            : null;
                        confirmAction?.();
                        return;
                    }

                    return orig(...args);
                })
            );
        }
    },

    onUnload() {
        patches.forEach(p => p());
        patches = [];
    },
};
