import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

const MessageActions = findByProps("pinMessage", "unpinMessage");
const ConfirmPin = findByProps("confirmPin");
const ConfirmUnpin = findByProps("confirmUnpin");

let patches: (() => void)[] = [];

export default {
    name: "BypassPinPrompt",
    description: "Bypass the confirmation prompt when pinning or unpinning messages.",
    authors: [
        { name: "btmc727 (ported)" },
        { name: "thororen (original)" },
    ],

    onLoad() {
        if (!MessageActions) return;

        if (ConfirmPin?.confirmPin) {
            patches.push(
                instead("confirmPin", ConfirmPin, ([channel, message]) => {
                    MessageActions.pinMessage(channel, message.id);
                })
            );
        }

        if (ConfirmUnpin?.confirmUnpin) {
            patches.push(
                instead("confirmUnpin", ConfirmUnpin, ([channel, message]) => {
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
