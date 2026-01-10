// From https://stackoverflow.com/questions/54651201/how-do-i-covert-kebab-case-into-pascalcase
export function toPascalCase(text: string) {
    return text.replace(/(^\w|-\w)/g, clearAndUpper);
}

// From https://stackoverflow.com/questions/54651201/how-do-i-covert-kebab-case-into-pascalcase
function clearAndUpper(text: string) {
    return text.replace(/-/, "").toUpperCase();
}

/**
 * Make a valid typescript type name out of `name` that is in PascalCase.
 */
export function normalizeTypeName(name: string, prefix = ""): string {
    if (prefix === undefined) {
        prefix = ""
    }
    let ret = toPascalCase(name);
    ret = ret.replace(/[^a-zA-Z0-9_]/g, "");
    return prefix + ret;
}
