import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

const MessageActions = findByProps("pinMessage", "unpinMessage");
const Alerts = findByProps("show", "close", "openLazy");

let patches: (() => void)[] = [];

export default {
    name: "BypassPinPrompt",
    description: "Bypass the confirmation prompt when pinning or unpinning messages.",
    authors: [{ name: "btmc727(ported)  (original)thororen" }],

    onLoad() {
        if (!MessageActions) return;

        if (Alerts) {
            patches.push(
                instead("show", Alerts, (args, orig) => {
                    const alert = args[0];
                    const title: string = alert?.title ?? "";

                    if (title === "Pin Message" || title === "Unpin Message") {
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
