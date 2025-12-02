
import { SNBT } from './src/utils/snbt.js';
import fs from 'fs';

const testSnbt = `
{
	id: "123L"
	val: 1.5d
	list: [
		{ id: "item1", count: 10L }
		"string"
	]
	bool: true
}
`;

try {
    console.log("Parsing...");
    const parsed = SNBT.parse(testSnbt);
    console.log("Parsed:", JSON.stringify(parsed, null, 2));

    console.log("Stringifying...");
    const stringified = SNBT.stringify(parsed);
    console.log("Stringified:\n", stringified);

    console.log("Re-parsing...");
    const reparsed = SNBT.parse(stringified);
    console.log("Re-parsed matches original:", JSON.stringify(parsed) === JSON.stringify(reparsed));

    if (JSON.stringify(parsed) === JSON.stringify(reparsed)) {
        console.log("TEST PASSED");
    } else {
        console.error("TEST FAILED");
        process.exit(1);
    }

} catch (e) {
    console.error(e);
    process.exit(1);
}
