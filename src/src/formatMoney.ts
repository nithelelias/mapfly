export default function formatMoney(money: number) {
    const abs = Math.abs(money);
    const sign = money < 0 ? '-' : '';

    let formatted: string;

    if (abs >= 1_000_000) {
        formatted = trimZeros(abs / 1_000_000) + 'M';
    } else if (abs >= 100_000) {
        formatted = trimZeros(abs / 1_000) + 'k';
    } else if (abs >= 1_000) {
        formatted = trimZeros(abs / 1_000, 1) + 'k';
    } else {
        formatted = abs.toFixed(0);
    }

    return `${sign}$${formatted}`;
}

function trimZeros(n: number, decimals = 2): string {
    return parseFloat(n.toFixed(decimals)).toString();
}