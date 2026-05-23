import { findByProps } from "@vendetta/metro";
import { instead } from "@vendetta/patcher";

const MessageActions = findByProps("pinMessage", "unpinMessage");
const ActionSheetUtils = findByProps("openLazy", "hideActionSheet");

let patches: (() => void)[] = [];

export default {
    name: "BypassPinPrompt",
    description: "Bypass the confirmation prompt when pinning or unpinning messages.",
    authors: [{ name: "btmc727 (ported) (original) thororen" }],
    notes: [
        "🇺🇸 If the plugin does not work, please report it on the GitHub issue tracker.",
        "🇩🇪 Wenn das Plugin nicht funktioniert, melde es bitte im GitHub Issue Tracker.",
        "🇫🇷 Si le plugin ne fonctionne pas, veuillez le signaler sur le GitHub issue tracker.",
        "🇪🇸 Si el plugin no funciona, por favor repórtalo en el GitHub issue tracker.",
        "🇧🇷 Se o plugin não funcionar, por favor reporte no GitHub issue tracker.",
        "🇷🇺 Если плагин не работает, сообщите об этом в GitHub issue tracker.",
        "🇯🇵 プラグインが動作しない場合は、GitHubのissueトラッカーに報告してください。",
        "🇨🇳 如果插件不工作，请在GitHub issue tracker上报告。",
        "🇰🇷 플러그인이 작동하지 않으면 GitHub issue tracker에 보고해 주세요.",
        "🇵🇱 Jeśli wtyczka nie działa, zgłoś to na GitHub issue tracker.",
        "🇳🇱 Als de plugin niet werkt, meld het dan op de GitHub issue tracker.",
        "🇸🇪 Om pluginet inte fungerar, rapportera det på GitHub issue tracker.",
        "🇳🇴 Hvis pluginen ikke fungerer, vennligst rapporter det på GitHub issue tracker.",
        "🇩🇰 Hvis pluginnet ikke virker, skal du rapportere det på GitHub issue tracker.",
        "🇫🇮 Jos laajennus ei toimi, ilmoita siitä GitHub issue trackerissa.",
        "🇭🇺 Ha a plugin nem működik, kérjük jelentsd a GitHub issue trackerben.",
        "🇷🇴 Dacă pluginul nu funcționează, vă rugăm să raportați pe GitHub issue tracker.",
        "🇭🇷 Ako plugin ne radi, prijavite ga na GitHub issue trackeru.",
        "🇱🇹 Jei įskiepis neveikia, praneškite apie tai GitHub issue tracker.",
        "🇹🇷 Eklenti çalışmıyorsa lütfen GitHub issue tracker'da bildirin.",
    ].join("\n"),

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
