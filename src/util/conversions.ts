interface BytesToReadableOptions {
    decimals?: number,
    speedtestLike?: boolean
}

export function bytesToReadable(bytes: number, options?: BytesToReadableOptions) {

    if (bytes === 0) return options?.speedtestLike ? `0 KB/s` : `0 KB`;

    const kb = 1024, mb = kb * kb, gb = mb * kb;
    if (bytes < kb) return options?.speedtestLike ? `1 KB/s` : `1 KB`;

    const { format } = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: options?.decimals ?? 2,
        useGrouping: false
    });

    if (bytes < mb) return options?.speedtestLike ? `${format(bytes / kb)} KB/s` : `${format(bytes / kb)} KB`;
    if (bytes < gb) return options?.speedtestLike ? `${format(bytes / mb)} MB/s` : `${format(bytes / mb)} MB`;
    return options?.speedtestLike ? `${format(bytes / gb)} GB/s` : `${format(bytes / gb)} GB`;

}