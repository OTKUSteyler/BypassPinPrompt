import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

const MessageActions = findByProps("pinMessage", "unpinMessage");
const ActionSheetUtils = findByProps("openLazy", "hideActionSheet");

let patches: (() => void)[] = [];

export default {
    name: "BypassPinPrompt",
    description: "Bypass the confirmation prompt when pinning or unpinning messages.",
    authors: [{ name: "thororen (ported)" }],

    onLoad() {
        if (!MessageActions || !ActionSheetUtils) return;

        patches.push(
            instead("openLazy", ActionSheetUtils, (args, orig) => {
                const sheet = args[1];

                if (sheet?.pin) {
                    const { channelId, messageId } = sheet;
                    MessageActions.pinMessage(channelId, messageId);
                    ActionSheetUtils.hideActionSheet();
                    return;
                }

                if (sheet?.unpin) {
                    const { channelId, messageId } = sheet;
                    MessageActions.unpinMessage(channelId, messageId);
                    ActionSheetUtils.hideActionSheet();
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
