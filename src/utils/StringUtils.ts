export function AttachNumberOrdinal(num: number): string {
    const tens = num % 100;
    const ones = num % 10;
    if (tens === 11 || tens === 12 || tens === 13) {
        return num + "th";
    }
    else if (ones === 1) {
        return num + "st";
    }
    else if (ones === 2) {
        return num + "nd";
    }
    else if (ones === 3) {
        return num + "rd";
    }
    else {
        return num + "th";
    }
}

