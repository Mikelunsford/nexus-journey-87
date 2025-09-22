import JSZip from 'jszip';

export interface BundleFile {
  name: string;
  content: string;
  description?: string;
}

export interface BundleOptions {
  bundleName: string;
  files: BundleFile[];
  readme: string;
  includeMetadata?: boolean;
}

export class BundleExporter {
  static async createBundle(options: BundleOptions): Promise<void> {
    const zip = new JSZip();
    
    // Add README.md first
    zip.file('README.md', options.readme);
    
    // Add all files
    for (const file of options.files) {
      zip.file(file.name, file.content);
    }
    
    // Add metadata if requested
    if (options.includeMetadata) {
      const metadata = {
        generatedAt: new Date().toISOString(),
        bundleName: options.bundleName,
        fileCount: options.files.length,
        generator: 'Team1 Portal Export System',
        version: '1.0.0'
      };
      zip.file('_metadata.json', JSON.stringify(metadata, null, 2));
    }
    
    // Generate and download zip
    const content = await zip.generateAsync({ type: 'blob' });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `${options.bundleName}_${timestamp}.zip`;
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
  
  static sanitizeContent(content: string): string {
    // Remove sensitive information
    return content
      .replace(/password[s]?\s*[:=]\s*[^\s\n]+/gi, 'password: [REDACTED]')
      .replace(/api[_-]?key[s]?\s*[:=]\s*[^\s\n]+/gi, 'api_key: [REDACTED]')
      .replace(/secret[s]?\s*[:=]\s*[^\s\n]+/gi, 'secret: [REDACTED]')
      .replace(/token[s]?\s*[:=]\s*[^\s\n]+/gi, 'token: [REDACTED]')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN_REDACTED]')
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD_REDACTED]');
  }
  
  static generateTableOfContents(files: BundleFile[]): string {
    let toc = '## Files in this Bundle\n\n';
    files.forEach(file => {
      toc += `### ${file.name}\n`;
      if (file.description) {
        toc += `${file.description}\n\n`;
      } else {
        toc += 'Generated data file.\n\n';
      }
    });
    return toc;
  }
}