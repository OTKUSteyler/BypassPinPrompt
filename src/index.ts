import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

const MessageActions = findByProps("pinMessage", "unpinMessage");
const Alerts = findByProps("show", "close", "openLazy");
const i18n = findByProps("Messages", "getLocale");

let patches: (() => void)[] = [];

export default {
    name: "BypassPinPrompt",
    description: "Bypass the confirmation prompt when pinning or unpinning messages.",
    authors: [{ name: "btmc727 (ported) (original) thororen" }],

    onLoad() {
        if (!MessageActions || !Alerts) return;

        patches.push(
            instead("show", Alerts, (args, orig) => {
                const alert = args[0];
                const title: string = alert?.title ?? "";

                const pinTitle = i18n?.Messages?.PIN_MESSAGE ?? "Pin Message";
                const unpinTitle = i18n?.Messages?.UNPIN_MESSAGE ?? "Unpin Message";

                if (title === pinTitle || title === unpinTitle) {
                    alert?.onConfirm?.();
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
