window.addEventListener('DOMContentLoaded', event => {
    // Simple-DataTables
    // https://github.com/fiduswriter/Simple-DataTables/wiki

    $(document).ready(function() {
        $('#datatablesSimple').DataTable( {
            dom: 'Bfrtip',
            buttons: [
                'copyHtml5',
                'excelHtml5',
                'csvHtml5',
                'pdfHtml5'
            ]
        } );
    } );

    // const datatablesSimple = document.getElementById('datatablesSimple');
    // if (datatablesSimple) {
    //     new simpleDatatables.DataTable({dom: 'Bfrtip', buttons: ['copy', 'excel', 'pdf', 'print']});
    // }
    // const datatablesSimple = document.getElementById('datatablesSimple');
    // if (datatablesSimple) {
    //     new simpleDatatables.DataTable(datatablesSimple);
    // }
    // const pendingTable = document.getElementById("pendingOrdersTable")
    // if (pendingTable) {
    //     new simpleDatatables.DataTable(pendingTable)
    // }
    $(document).ready(function() {
        $('#pendingOrdersTable').DataTable( {
            dom: 'Bfrtip',
            buttons: [
                'copyHtml5',
                'excelHtml5',
                'csvHtml5',
                'pdfHtml5'
            ]
        } );
    } );
    // const pendingTable2 = document.getElementById("pendingOrdersTable2")
    // if (pendingTable) {
    //     new simpleDatatables.DataTable(pendingTable2)
    // }
    $(document).ready(function() {
        $('#mostLovedProductsTable').DataTable( {
            dom: 'Bfrtip',
            buttons: [
                'copyHtml5',
                'excelHtml5',
                'csvHtml5',
                'pdfHtml5'
            ]
        } );
    } );
    // const pendingTable3 = document.getElementById("pendingOrdersTable3")
    // if (pendingTable) {
    //     new simpleDatatables.DataTable(pendingTable3)
    // }
    // const notificationsTable = document.getElementById("notificationsTable")
    $(document).ready(function() {
        $('#bestSellerTable').DataTable( {
            dom: 'Bfrtip',
            buttons: [
                'copyHtml5',
                'excelHtml5',
                'csvHtml5',
                'pdfHtml5'
            ]
        } );
    } );
    $(document).ready(function() {
        $('#runningOutProductsTable').DataTable( {
            dom: 'Bfrtip',
            buttons: [
                'copyHtml5',
                'excelHtml5',
                'csvHtml5',
                'pdfHtml5'
            ]
        } );
    } );
    // if (notificationsTable) {
    //     new simpleDatatables.DataTable(notificationsTable)
    // }
    $(document).ready(function() {
        $('#notificationsTable').DataTable( {
            dom: 'Bfrtip',
            buttons: [
                'copyHtml5',
                'excelHtml5',
                'csvHtml5',
                'pdfHtml5'
            ]
        } );
    } );
});
