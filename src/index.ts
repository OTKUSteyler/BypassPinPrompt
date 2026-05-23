import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

const MessageActions = findByProps("pinMessage", "unpinMessage");
const PinConfirm = findByProps("confirmPin") ?? findByProps("confirmUnpin");

let patches: (() => void)[] = [];

export default {
    name: "BypassPinPrompt",
    description: "Bypass the confirmation prompt when pinning or unpinning messages.",
    authors: [{ name: "btmc727 (ported) (original) thororen" }],

    onLoad() {
        if (!MessageActions) return;

        if (PinConfirm?.confirmPin) {
            patches.push(
                instead("confirmPin", PinConfirm, ([channel, message]) => {
                    MessageActions.pinMessage(channel, message.id);
                })
            );
        }

        if (PinConfirm?.confirmUnpin) {
            patches.push(
                instead("confirmUnpin", PinConfirm, ([channel, message]) => {
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
