$(document).ready(function() {
    $(window).bind("beforeunload",function(event) {
        return ".";
    });
    verifyLocalStorage();
    loadSettings();

    //validateNumberInput($("body").find("input[type='number']"));
});

function findTeamByName(teamName) {
    let value = "";
    $.each(_teams,(idx, obj) => {
        if (obj.teamName === teamName) {
            value = obj;
        }
    });

    return value;
}

function editTeamSettings($teamRef) {
    const modal = $getModalReference();
    const teamName = $teamRef.parent().parent().find(".team-name").text();
    const teamObjRef = findTeamByName(teamName);
    modal.modal('show');

    if (typeof teamObjRef.variableOccupation !== "undefined") {
        $.each(modal.find("input"), (idx, input) => {
           $(input).val(teamObjRef.variableOccupation[idx]);
        });
    } else {
        modal.find("input").val(getOccupation());
    }

    $("#modal-team-title").text(teamName + " settings");

    $("#btn-save-team-changes").off().on('click', () => {
        teamObjRef.variableOccupation = [
            $("#vo-seg").val(),
            $("#vo-ter").val(),
            $("#vo-qua").val(),
            $("#vo-qui").val(),
            $("#vo-sex").val()
        ];

        $getModalReference().modal('hide');
    });

}

function addTeam() {
    $getTeam().insertBefore($("#add-team-button").parent());
}

function saveTeam($saveBtn) {
    const $teamName = $saveBtn.parent().parent().find(".team-name").first().find("input");
    const $teamSize = $saveBtn.parent().parent().find(".team-size").first().find("input");

    $teamName.parent().text($teamName.val());
    $teamSize.parent().text($teamSize.val());

    $saveBtn.closest(".not-ready").removeClass("not-ready").addClass("ready");

    $saveBtn.parent().append($getEditButton());
    $saveBtn.parent().append($getTeamSettingsButton());
    $saveBtn.remove();

    updateTeams();
}

function editTeam($editBtn) {
    const $teamName = $editBtn.parent().parent().find(".team-name").first();
    const $teamSize = $editBtn.parent().parent().find(".team-size").first();
    const teamName = $teamName.text();
    const teamSize = $teamSize.text();
    $teamName.empty();
    $teamSize.empty();

    $editBtn.closest(".ready").removeClass("ready").addClass("not-ready");
    $editBtn.parent().find(".fa-cog").remove();

    $("<input type='text' class='form-control'>").val(teamName).appendTo($teamName);
    $("<input type='number' class='form-control' min='1'>").val(teamSize).appendTo($teamSize);

    $editBtn.parent().append($getSaveTeamButton());
    $editBtn.remove();

    updateTeams();
}

function removeTeam($removeBtn) {
    $removeBtn.parent().parent().remove();
    updateTeams();
}

function updateTeams() {
    _teams = [];
    $.each($getReadyTeams(), (idx, obj) => {
        _teams.push({
            teamName: $(obj).find(".team-name").first().text(),
            teamSize: $(obj).find(".team-size").first().text()
        });
    });

    updateSwitchTable();
    updateTotalPeople();
    saveSettings();
}

function updateSwitchTable() {
    var $pill, $row;
    $getSwitchTable().find(".switch-table-row").remove();
    $.each(_teams, (idx, obj) => {
        $pill = $getSwitchTablePill().text(obj.teamName);
        $row = $getSwitchTableRow();
        $row.find("td").first().append($pill);
        $getSwitchTable().append($row);
    });

    //add "Free" team on the switch table
    $pill = $getSwitchTablePill().text("Free");
    $row = $getSwitchTableRow();
    $row.find("td").first().append($pill);
    $getSwitchTable().append($row);

    //add custom team on the switch table
    $row = $getSwitchTableRow();
    $row.find("td").append($getCustomSwitchInput());
    $getSwitchTable().append($row);
}

function generateTeamSeats() {
    $.each(_teams, (idx, team) => {
        if (typeof team.variableOccupation !== "undefined") {
            team.teamSeats = [];
            for (let x = 0; x < 5; x++) {
                team.teamSeats.push(Math.round(team.teamSize / getTotalPeople() * getTotalSeats() * (Number(team.variableOccupation[x])/100)))
            }
        } else {
            team.teamSeats = Math.round(team.teamSize / getTotalPeople() * getTotalSeats() * (getOccupation()/100));
            if (team.teamSeats > team.teamSize) team.teamSeats = team.teamSize;
        }
    });
}

function generate() {
    /*
    if (!validateParameters()) {
        alert("Parameters are invalid");
        return false;
    }*/

    generateSeats();
    generateTeamSeats();
    saveSettings();

    var weekdaySlots, seatPool =[], $pillHolder;

    $.each(getWeekDaysClass(), (idx, obj) => {
        weekdaySlots = $getMainTBody().find(obj);

        $.each(_teams, (teamId, team) => {
            let seatLimitation = team.teamSeats[idx] || team.teamSeats;
            for (var x = 0; x < seatLimitation; x++) {
                seatPool.push(team.teamName);
            }
        });

        $.each(weekdaySlots, (slotId, seat) => {
            $pillHolder = $getSchedulePill();
            if (seatPool.length > 0) {
                $(seat).append($pillHolder.text(seatPool.shift()))
            } else {
                $(seat).append($pillHolder.text("Free"))
            }
        });

        seatPool = [];

    });
}

function generateSeats() {
    $getMainTBody().empty();
    for (var x = 0; x < getTotalSeats(); x++) {
        $getTableRow().appendTo($getMainTBody());
    }
}


