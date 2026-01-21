/**
 * Replaces ad shortcodes in content with AdSense HTML
 *
 * Shortcodes handled:
 * - [author_ad]
 * - [ad_2]
 * - [ad_3]
 * - [ad_4]
 * - [ad_5]
 */
export const replaceAdShortcodes = (content) => {
    if (!content) return content;

    let newContent = content;

    // author_ad - Client: ca-pub-6764478945960117, Slot: 3384451209
    newContent = newContent.replace(/\[author_ad\]/g, `
        <div class="ad-wrapper my-6 flex justify-center">
            <!-- Author ad -->
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-6764478945960117"
                 data-ad-slot="3384451209"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
        </div>
    `);

    // ad_2 - Client: ca-pub-6764478945960117, Slot: 2742820353
    newContent = newContent.replace(/\[ad_2\]/g, `
        <div class="ad-wrapper my-6 text-center">
            <ins class="adsbygoogle"
                 style="display:block; text-align:center;"
                 data-ad-layout="in-article"
                 data-ad-format="fluid"
                 data-ad-client="ca-pub-6764478945960117"
                 data-ad-slot="2742820353"></ins>
        </div>
    `);

    // ad_3 - Client: ca-pub-6764478945960117, Slot: 5063530238
    newContent = newContent.replace(/\[ad_3\]/g, `
        <div class="ad-wrapper my-6 text-center">
            <ins class="adsbygoogle"
                 style="display:block; text-align:center;"
                 data-ad-layout="in-article"
                 data-ad-format="fluid"
                 data-ad-client="ca-pub-6764478945960117"
                 data-ad-slot="5063530238"></ins>
        </div>
    `);

    // ad_4 - Client: ca-pub-6764478945960117, Slot: 3429731355
    newContent = newContent.replace(/\[ad_4\]/g, `
        <div class="ad-wrapper my-6 text-center">
            <ins class="adsbygoogle"
                 style="display:block; text-align:center;"
                 data-ad-layout="in-article"
                 data-ad-format="fluid"
                 data-ad-client="ca-pub-6764478945960117"
                 data-ad-slot="3429731355"></ins>
        </div>
    `);

    // ad_5 - Client: ca-pub-6764478945960117, Slot: 5923769426
    newContent = newContent.replace(/\[ad_5\]/g, `
        <div class="ad-wrapper my-6">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-format="autorelaxed"
                 data-ad-client="ca-pub-6764478945960117"
                 data-ad-slot="5923769426"></ins>
        </div>
    `);

    return newContent;
};
