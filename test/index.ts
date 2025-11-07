import Innertube, { Platform, Types, ClientType } from "youtubei.js";
import * as ytb from "youtubei.js"


Platform.shim.eval = async (data: Types.BuildScriptResult, env: Record<string, Types.VMPrimative>) => {
    const properties = [];

    if (env.n) {
        properties.push(`n: exportedVars.nFunction("${env.n}")`)
    }

    if (env.sig) {
        properties.push(`sig: exportedVars.sigFunction("${env.sig}")`) 
    }

    const code = `${data.output}\nreturn { ${properties.join(', ')} }`;

    return new Function(code)();
}

const id = "dsRLVc6at74";
let url = "";
(async () => {
                        // const po_token = await generate()

    let youtube_player = await Innertube.create({client_type:ClientType.ANDROID})
    try {
        const format = await youtube_player.getStreamingData(id, {type:"audio", quality:"best"});
        // const format = info.chooseFormat({ type: 'audio', quality: 'best' });
        if (format) {
            url = await format.decipher() ?? "";
        }
        else {
            url = "";
        }
        console.log(url)
    }
    catch (e) {
        console.log(e)
        url = "";
        youtube_player = await Innertube.create({ client_type: ClientType.TV });
    }
})();