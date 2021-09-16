$(document).ready( function () {
  
  
    $('#example').DataTable( {
      dom:'Bfrtip',
        order: [[2, 'asc']],
        rowGroup: {
            startRender: null,
            endRender: function ( rows, group ) {
              addClass = 'colorCheck';
               return $('<tr/>')
                    .addClass(addClass)
                    .append( '<td>' + group + '</td>' )
                    .append( '<td>(' + rows.count() + ')</td>' )
                    .append( '<td></td>' )
                    .append( '<td></td>' )
                    .append( '<td></td>' )
                    .append( '<td></td>' );
            },
            dataSrc: 2
        },
      buttons: [{ text:'PDF',
        extend: 'pdf',
        footer : true,
        header : true,
        orientation:'landscape',
        pageSize: 'LEGAL',
        page:'current',
        customize: function (doc) {
            console.log(doc); 

            var lastColX=null;
            var lastColY=null;
            var headerRows = 1;
            var dataSrc = 2;
            var age =  3;
            var ageArray = [];  // Array of ages for the group
            
            var endRenderText = '';  // Keep track of dataSrc column value change for endRender

            var bod = []; // this will become our new body (an array of arrays(lines))
            //Loop over all lines in the table
            doc.content[1].table.body.forEach(function(line, i){
                //Group based on dataSrc column (ignore empty cells)
                if(endRenderText != line[dataSrc].text && line[dataSrc].text != '' && (i+1) > headerRows){
                    nextEndRender = line[dataSrc].text;
                    
                    //Add line with group header at end of group
                    if (endRenderText !== '') {
                    console.log('Next:' +nextEndRender)
                    
                    // Sum the age array
                    sum_ages = ageArray.reduce( function (a, b) {
                    return a + b;
                    }, 0 );
                    
                    ageArray = [];  // Clear the age array for next group
                    
                    bod.push([{text: endRenderText, style:'tableHeader'},
                                {text: sum_ages, style:'tableHeader'},
                                '',
                                '',
                                '',
                                '']);
                    }
                
                // Get next endRender value
                endRenderText=nextEndRender;
                    
                    
                }
                
                //Add line with data except grouped data
                if( i < doc.content[1].table.body.length+1){
                
                    // Add age to array if its not header or footer
                    var lineStyle = line[age].style;
                    if ( lineStyle !== 'tableHeader' && lineStyle !== 'tableFooter' ) {
                        ageArray.push(parseInt(line[age].text));
                    }
                
                    bod.push([{text:line[0].text, style:'defaultStyle'},
                                {text:line[1].text, style:'defaultStyle'},
                                {text:line[2].text, style:'defaultStyle'},
                                {text:line[3].text, style:'defaultStyle'},
                                {text:line[4].text, style:'defaultStyle'},
                                {text:line[5].text, style:'defaultStyle'},
                            ]);

                }

            });
            //Overwrite the old table body with the new one.
            doc.content[1].table.headerRows = 1;
            doc.content[1].table.widths = 
                            [50,
                                50, 
                                50, 
                                50,
                                50,
                                50];
            doc.content[1].table.body = bod;
            doc.content[1].layout = 'lightHorizontalLines';

                                doc.styles = {
                subheader: {
                    fontSize: 10,
                    bold: true,
                    color: 'black'
                },
                tableHeader: {
                    bold: true,
                    fontSize: 10.5,
                    color: 'black'
                },
                lastLine: {
                    bold: true,
                    fontSize: 11,
                    color: 'blue'
                },
                defaultStyle: {
                fontSize: 10,
                color: 'black',
                                text:'center'

                }
            };

        }
    }
],
      
    } );
  

} );
