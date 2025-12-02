
import React from 'react';
import { SNBT } from '../utils/snbt';

function Exporter({ data, filename }) {
    const handleExport = () => {
        try {
            console.log('Exporting data:', data);
            console.log('Filename:', filename);

            if (!data) {
                alert('No data to export');
                return;
            }

            const snbtString = SNBT.stringify(data);
            console.log('SNBT String generated, length:', snbtString.length);
            console.log('First 100 chars:', snbtString.substring(0, 100));

            // Create blob with explicit UTF-8 encoding
            const blob = new Blob([snbtString], { type: 'text/plain;charset=utf-8' });

            // Use a more reliable download method
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.href = url;
            link.download = filename || 'export.snbt';

            // Ensure the link is added to the document
            link.style.display = 'none';
            document.body.appendChild(link);

            // Trigger download
            link.click();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                console.log('Export successful! File:', filename);
            }, 100);

        } catch (e) {
            console.error('Export error:', e);
            alert("Error exporting: " + e.message + "\n\nCheck console for details.");
        }
    };

    return (
        <div className="exporter">
            <button className="btn" onClick={handleExport}>
                Export SNBT
            </button>
        </div>
    );
}

export default Exporter;
