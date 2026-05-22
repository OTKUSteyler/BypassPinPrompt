import { findByProps } from "@vendetta/metro";
import { before } from "@vendetta/patcher";

// The pin confirmation dialogs live in a module that exposes confirmPin / confirmUnpin.
// We find that module and patch it so both functions immediately call the actual
// pin/unpin action instead of showing a confirmation prompt.
const ChannelActions = findByProps("pinMessage", "unpinMessage");
const PinConfirm = findByProps("confirmPin", "confirmUnpin");

let patches: (() => void)[] = [];

export default {
    name: "BypassPinPrompt",
    description: "Bypass the confirmation prompt when pinning or unpinning messages.",
    authors: [{ name: "thororen (ported)" }],

    onLoad() {
        if (PinConfirm && ChannelActions) {
            // Override confirmPin to directly call pinMessage
            patches.push(
                before("confirmPin", PinConfirm, ([channel, message]) => {
                    ChannelActions.pinMessage(channel, message.id);
                    return []; // suppress original (returning empty args kills the call)
                })
            );

            // Override confirmUnpin to directly call unpinMessage
            patches.push(
                before("confirmUnpin", PinConfirm, ([channel, message]) => {
                    ChannelActions.unpinMessage(channel, message.id);
                    return [];
                })
            );
        }
    },

    onUnload() {
        patches.forEach(p => p());
        patches = [];
    },
};
