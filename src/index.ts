import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

const MessageActions = findByProps("pinMessage", "unpinMessage");

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
    },

    onUnload() {
        patches.forEach(p => p());
        patches = [];
    },
};
