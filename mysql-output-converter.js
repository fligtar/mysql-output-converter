function example() {
    document.getElementById('mysql').value = document.getElementById('example').innerHTML;
    
    mysql2csv();
}

function mysql2csv(quotes) {
    var mysql = document.getElementById('mysql').value;
    
    var column_callback = function(columns) {
        if (quotes)
            return '"' + columns.join('","') + '"';
        else
            return columns.join(',');
    }
    
    var rows = convert_lines(mysql, column_callback);
    
    document.getElementById('output').value = rows.join('\n');
}

function mysql2html() {
    var mysql = document.getElementById('mysql').value;
    
    var column_callback = function(columns) {
            return '<tr><td>' + columns.join('</td><td>') + '</td></tr>';
    }
    
    var rows = convert_lines(mysql, column_callback);
    
    var html = '<table><thead><tr>';
    
    // Strip out first row as header
    
    
    html += '</tr></thead><tbody>' + rows.join('\n') + '</tbody></table>';
    
    document.getElementById('output').value = html;
}

function convert_lines(mysql, column_callback) {
    // Trim down input to the start and end of the actual data
    mysql = mysql.substring(mysql.indexOf('+--'), mysql.lastIndexOf('--+') + 3);
    
    // Split into lines
    var lines = mysql.split('\n');
    
    /* First, third, and last lines are separators. Take the first separator
       without the ending +s and split into columns in order to get the
       number of characters in each column. */
    var columns = lines[0].substring(1, lines[0].length - 1).split('+');
    var column_lengths = [];
    for (var column in columns) {
        column_lengths.push(columns[column].length);
    }
    
    // Remove the separators
    lines.splice(0, 1);
    lines.splice(1, 1);
    lines.splice(lines.length - 1, 1);
    
    /* Now we're left with only the header and the data. We first split
       columns on the | separator that MySQL uses, but make sure that
       the number of columns we end up with matches the actual number
       from the separator. If there are too many columns, one or more
       of the fields had a | in its value, so we split based on lengths
       instead, since MySQL outputs columns padded with spaces for
       equal length. */
    var rows = [];
    var str;

    for (var line in lines) {
        line = lines[line].substring(1, lines[line].length - 2);
        columns = line.split('|');
        
        if (columns.length != column_lengths.length) {
            /* Column lengths don't match because there's one or more
               stray |. Use the set column widths instead */
            
            columns = [];
            var pointer = 0;
            
            for (var column in column_lengths) {
                columns.push(line.substr(pointer, column_lengths[column]));
                
                pointer += column_lengths[column] + 1;
            }
        }
        
        // Go through each column and trim the space
        for (var column in columns) {
            columns[column] = columns[column].replace(/^\s+|\s+$/g, '');
        }
        
        // We're ready to format based on the conversion type and add it
        rows.push(column_callback(columns));
    }
    
    
    return rows;
}
