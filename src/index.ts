import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

const MessageActions = findByProps("pinMessage", "unpinMessage");
const Alerts = findByProps("show", "close", "openLazy");

let patches: (() => void)[] = [];

export default {
    name: "BypassPinPrompt",
    description: "Bypass the confirmation prompt when pinning or unpinning messages.",
    authors: [{ name: "btmc727 (ported) (original) thororen" }],

    onLoad() {
        if (!MessageActions) return;

        patches.push(
            instead("pinMessage", MessageActions, (args, orig) => {
                return orig(...args);
            })
        );

        patches.push(
            instead("unpinMessage", MessageActions, (args, orig) => {
                return orig(...args);
            })
        );

        if (Alerts) {
            patches.push(
                instead("show", Alerts, (args, orig) => {
                    const alert = args[0];

                    const hasConfirmAndCancel =
                        alert?.onConfirm &&
                        alert?.onCancel !== undefined &&
                        alert?.confirmText &&
                        alert?.cancelText;

                    const bodyStr: string = alert?.body ?? alert?.content ?? "";
                    const isPinAlert =
                        typeof bodyStr === "string" &&
                        (bodyStr.includes("pin") || bodyStr.includes("Pin") ||
                         bodyStr.includes("unpin") || bodyStr.includes("Unpin"));

                    if (hasConfirmAndCancel && isPinAlert) {
                        alert.onConfirm?.();
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
